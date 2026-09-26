<?php
declare(strict_types=1);

/**
 * API route table.
 *
 * Convention:
 *   GET  /api/...          → public, no authentication
 *   *    /api/admin/...    → requires a signed-in admin AND a valid CSRF token
 *
 * Every admin handler calls adminGate() as its first statement. That call is
 * the real authorization boundary — Angular's route guards only decide what to
 * render, they do not protect anything.
 */

use LeadFarmer\App\CollectionRepo;
use LeadFarmer\App\ContactRepo;
use LeadFarmer\App\ContentRepo;
use LeadFarmer\App\MediaRepo;
use LeadFarmer\App\StrainRepo;
use LeadFarmer\Lib\Auth;
use LeadFarmer\Lib\Database;
use LeadFarmer\Lib\Mailer;
use LeadFarmer\Lib\Request;
use LeadFarmer\Lib\Response;
use LeadFarmer\Lib\Router;
use LeadFarmer\Lib\Uploads;
use LeadFarmer\Lib\Validator;

/** Authenticate + CSRF-check in one call. Returns the signed-in admin. */
$adminGate = static function (Request $request): array {
    $user = Auth::requireAdmin();
    Auth::requireCsrf($request);
    return $user;
};

$router = new Router();

// ---------------------------------------------------------------------------
// Health / diagnostics
// ---------------------------------------------------------------------------

$router->get('/health', static function (): void {
    $dbOk = true;
    try {
        Database::one('SELECT 1 AS ok');
    } catch (\Throwable) {
        $dbOk = false;
    }

    Response::ok(['status' => 'up', 'database' => $dbOk ? 'connected' : 'unavailable']);
});

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

$router->get('/auth/session', static function (): void {
    $user = Auth::currentUser();

    // The CSRF token is issued to anonymous callers too, because the login POST
    // itself is a state-changing request that must carry one.
    Response::ok([
        'authenticated' => $user !== null,
        'user'          => $user,
        'csrfToken'     => Auth::csrfToken(),
    ]);
});

$router->post('/auth/login', static function (Request $request): void {
    Auth::requireCsrf($request);

    $v = new Validator($request->body());
    $username = (string) $v->string('username', required: true, max: 191, label: 'username');
    $password = (string) $v->string('password', required: true, max: 400, label: 'password');
    $v->stopIfFailed();

    $result = Auth::attemptLogin($username, $password, $request->ip());

    if (!$result['ok']) {
        Response::error(401, 'invalid_credentials', (string) ($result['message'] ?? 'Sign-in failed.'));
    }

    Response::ok(['user' => $result['user'], 'csrfToken' => Auth::csrfToken()]);
});

$router->post('/auth/logout', static function (Request $request): void {
    Auth::requireCsrf($request);
    Auth::logout();
    Response::ok(['authenticated' => false]);
});

// ---------------------------------------------------------------------------
// Public read endpoints
// ---------------------------------------------------------------------------

/** Everything the public site needs, in one request. */
$router->get('/public/site', static function (): void {
    $content = ContentRepo::publicMap();
    $dispensaries = CollectionRepo::all('dispensaries', publishedOnly: true);

    $stats = array_map(
        static function (array $stat) use ($dispensaries): array {
            // A stat can track a live number instead of being typed by hand.
            if (($stat['autoSource'] ?? null) === 'dispensary_count') {
                $stat['value'] = (string) count($dispensaries);
            }
            return $stat;
        },
        CollectionRepo::all('story-stats', publishedOnly: true)
    );

    Response::ok([
        'content'       => $content['values'],
        'images'        => $content['images'],
        'strains'       => StrainRepo::all(publishedOnly: true),
        'dispensaries'  => $dispensaries,
        'articles'      => CollectionRepo::all('articles', publishedOnly: true),
        'gallery'       => CollectionRepo::all('gallery', publishedOnly: true),
        'storySections' => CollectionRepo::all('story-sections', publishedOnly: true),
        'storyStats'    => $stats,
    ]);
});

$router->get('/public/strains', static function (): void {
    Response::ok(StrainRepo::all(publishedOnly: true));
});

$router->get('/public/strains/{slug}', static function (Request $request, array $params): void {
    $strain = StrainRepo::findBySlug($params['slug'], publishedOnly: true);

    if ($strain === null) {
        Response::notFound('No strain found with that web address.');
    }

    Response::ok($strain);
});

$router->get('/public/dispensaries', static function (): void {
    Response::ok(CollectionRepo::all('dispensaries', publishedOnly: true));
});

$router->get('/public/articles', static function (): void {
    Response::ok(CollectionRepo::all('articles', publishedOnly: true));
});

// ---------------------------------------------------------------------------
// Public — contact form
//
// Open to anonymous visitors, so it is protected by shape rather than by a
// session: a honeypot field, a per-IP hourly cap, and strict validation. The
// recipient always comes from configuration — a visitor can never choose who
// their message is delivered to, so this cannot be used as an open relay.
// ---------------------------------------------------------------------------

$router->post('/contact', static function (Request $request): void {
    $v = new Validator($request->body());

    // Bots fill in every field they can see; real browsers leave this one empty
    // because it is hidden. Answer 200 so a bot cannot tell it was rejected.
    $honeypot = (string) ($v->string('website', max: 200) ?? '');
    if ($honeypot !== '') {
        Response::ok(['received' => true]);
    }

    $data = [
        'name'       => (string) $v->string('name', required: true, max: 191, label: 'name'),
        'email'      => (string) $v->string('email', required: true, max: 191, label: 'email address'),
        'phone'      => (string) ($v->string('phone', max: 60) ?? ''),
        'subject'    => (string) ($v->string('subject', max: 191) ?? ''),
        'message'    => (string) $v->string('message', required: true, max: 5000, min: 10, label: 'message'),
        'strainName' => (string) ($v->string('strainName', max: 191) ?? ''),
    ];

    if ($data['email'] !== '' && filter_var($data['email'], FILTER_VALIDATE_EMAIL) === false) {
        $v->addError('email', 'Enter a valid email address so we can reply.');
    }

    $v->stopIfFailed();

    if (ContactRepo::isRateLimited($request->ip())) {
        Response::error(
            429,
            'rate_limited',
            'You have sent several messages recently. Please give us a little time to reply before sending another.'
        );
    }

    // Recipient comes from the site's own settings, never from the request.
    $recipientRow = ContentRepo::findByKey('homepage.contactEmail');
    $recipient = $recipientRow !== null ? (string) $recipientRow['content_value'] : '';

    if ($recipient === '' || filter_var($recipient, FILTER_VALIDATE_EMAIL) === false) {
        error_log('[leadfarmer-api] Contact form: no valid recipient configured (homepage.contactEmail).');
        Response::error(500, 'not_configured', 'The contact form is not set up yet. Please email us directly.');
    }

    // Stored BEFORE the send is attempted. Delivery goes out over the network
    // and can be slow or fail; recording first means a timeout costs a
    // notification, never the enquiry itself.
    $messageId = ContactRepo::store($data, $request->ip(), false);

    // Keys become the labels in the client's inbox, in this order.
    $fields = [
        'Name'    => $data['name'],
        'Email'   => $data['email'],
        'Phone'   => $data['phone'],
        'Strain'  => $data['strainName'],
        'Message' => $data['message'],
    ];

    $result = Mailer::deliverEnquiry($recipient, $fields, $data['email'], $data['name']);

    if ($result['sent']) {
        ContactRepo::markEmailSent($messageId, true);
    }

    // The visitor is told it worked either way — their message is safely stored
    // and visible in the dashboard, flagged if the notification did not go out.
    Response::ok(['received' => true]);
});

// ---------------------------------------------------------------------------
// Admin — page content
// ---------------------------------------------------------------------------

$router->get('/admin/content', static function (Request $request) use ($adminGate): void {
    $adminGate($request);

    Response::ok([
        'sections' => ContentRepo::sections(),
        'blocks'   => ContentRepo::adminList($request->query('section')),
    ]);
});

$router->put('/admin/content', static function (Request $request) use ($adminGate): void {
    $adminGate($request);

    $v = new Validator($request->body());
    $updates = $v->objectList('blocks', static function (Validator $item): array {
        return [
            'key'     => (string) $item->string('key', required: true, max: 191, label: 'field key'),
            'value'   => (string) ($item->string('value', max: 65535) ?? ''),
            'altText' => (string) ($item->string('altText', max: 500) ?? ''),
        ];
    }, maxItems: 300);

    if ($updates === []) {
        $v->addError('blocks', 'No changes were submitted.');
    }
    $v->stopIfFailed();

    $unknown = ContentRepo::updateMany($updates);

    if ($unknown !== []) {
        Response::error(
            422,
            'unknown_fields',
            'These fields do not exist on the site: ' . implode(', ', $unknown)
        );
    }

    Response::ok(['updated' => count($updates), 'blocks' => ContentRepo::adminList()]);
});

// ---------------------------------------------------------------------------
// Admin — strains
// ---------------------------------------------------------------------------

$router->get('/admin/strains', static function (Request $request) use ($adminGate): void {
    $adminGate($request);
    Response::ok(StrainRepo::all(publishedOnly: false));
});

$router->get('/admin/strains/{id}', static function (Request $request, array $params) use ($adminGate): void {
    $adminGate($request);

    $strain = StrainRepo::findById((int) $params['id']);
    if ($strain === null) {
        Response::notFound('That strain no longer exists.');
    }

    Response::ok($strain);
});

/** Shared validation for create and update. */
$validateStrain = static function (Request $request, ?int $existingId): array {
    $v = new Validator($request->body());

    $data = [
        'name'             => (string) $v->string('name', required: true, max: 191, label: 'strain name'),
        'slug'             => (string) $v->slug('slug', required: true),
        'shortDescription' => (string) ($v->string('shortDescription', max: 1000) ?? ''),
        'featured'         => $v->bool('featured'),
        'isPublished'      => $v->bool('isPublished', true),
        'releaseDate'      => $v->date('releaseDate'),
    ];

    $imageValidator = static fn (Validator $item): array => [
        'src'   => (string) $item->url('src', required: true),
        'alt'   => (string) ($item->string('alt', max: 500) ?? ''),
        'label' => (string) ($item->string('label', max: 191) ?? ''),
    ];

    $mainImage = $request->input('mainImage');
    if (is_array($mainImage) && ($mainImage['src'] ?? '') !== '') {
        $mainValidator = new Validator($mainImage);
        $data['mainImage'] = $imageValidator($mainValidator);
        foreach ($mainValidator->errors() as $field => $message) {
            $v->addError("mainImage.{$field}", $message);
        }
    } else {
        $v->addError('mainImage', 'A main photo is required — it is what shows on the strain card.');
    }

    $data['galleryImages']   = $v->objectList('galleryImages', $imageValidator, maxItems: 30);
    $data['packagingImages'] = $v->objectList('packagingImages', $imageValidator, maxItems: 30);

    if ($data['slug'] !== '' && StrainRepo::slugExists($data['slug'], $existingId)) {
        $v->addError('slug', 'Another strain already uses that web address.');
    }

    $v->stopIfFailed();

    return $data;
};

$router->post('/admin/strains', static function (Request $request) use ($adminGate, $validateStrain): void {
    $adminGate($request);

    $data = $validateStrain($request, null);
    $id = StrainRepo::save(null, $data);

    Response::json(['ok' => true, 'data' => StrainRepo::findById($id)], 201);
});

$router->put('/admin/strains/{id}', static function (Request $request, array $params) use ($adminGate, $validateStrain): void {
    $adminGate($request);

    $id = (int) $params['id'];
    if (StrainRepo::findById($id) === null) {
        Response::notFound('That strain no longer exists.');
    }

    $data = $validateStrain($request, $id);
    StrainRepo::save($id, $data);

    Response::ok(StrainRepo::findById($id));
});

$router->delete('/admin/strains/{id}', static function (Request $request, array $params) use ($adminGate): void {
    $adminGate($request);

    if (!StrainRepo::delete((int) $params['id'])) {
        Response::notFound('That strain no longer exists.');
    }

    Response::ok(['deleted' => true]);
});

$router->post('/admin/strains/reorder', static function (Request $request) use ($adminGate): void {
    $adminGate($request);

    $v = new Validator($request->body());
    $ids = $v->stringList('ids', maxItems: 500);
    $v->stopIfFailed();

    StrainRepo::reorder(array_map('intval', $ids));

    Response::ok(['reordered' => count($ids)]);
});

// ---------------------------------------------------------------------------
// Admin — contact form messages
//
// Like /admin/media below, these are declared before the generic
// /admin/{resource} routes so the collection wildcard does not swallow them.
// ---------------------------------------------------------------------------

$router->get('/admin/messages', static function (Request $request) use ($adminGate): void {
    $adminGate($request);

    Response::ok([
        'messages' => ContactRepo::all(),
        'unread'   => ContactRepo::unreadCount(),
    ]);
});

$router->put('/admin/messages/{id}', static function (Request $request, array $params) use ($adminGate): void {
    $adminGate($request);

    $id = (int) $params['id'];
    if (ContactRepo::find($id) === null) {
        Response::notFound('That message no longer exists.');
    }

    $v = new Validator($request->body());
    $isRead = $v->bool('isRead', true);
    $v->stopIfFailed();

    ContactRepo::markRead($id, $isRead);

    Response::ok(ContactRepo::find($id));
});

$router->delete('/admin/messages/{id}', static function (Request $request, array $params) use ($adminGate): void {
    $adminGate($request);

    if (!ContactRepo::delete((int) $params['id'])) {
        Response::notFound('That message no longer exists.');
    }

    Response::ok(['deleted' => true]);
});

// ---------------------------------------------------------------------------
// Admin — media library
//
// Registered before the generic /admin/{resource} routes below: the router
// matches in declaration order, and "media" would otherwise be swallowed by the
// collection wildcard and rejected as an unknown resource.
// ---------------------------------------------------------------------------

$router->get('/admin/media', static function (Request $request) use ($adminGate): void {
    $adminGate($request);
    Response::ok(MediaRepo::all());
});

$router->post('/admin/media', static function (Request $request) use ($adminGate): void {
    $user = $adminGate($request);

    $file = $_FILES['file'] ?? null;
    if (!is_array($file)) {
        Response::error(400, 'no_file', 'Choose an image to upload.');
    }

    $stored = Uploads::store($file);

    $altText = $request->input('altText', '');
    $altText = is_string($altText) ? mb_substr(trim($altText), 0, 500) : '';

    $id = MediaRepo::record($stored, $altText, $user['id']);

    Response::json(['ok' => true, 'data' => MediaRepo::find($id)], 201);
});

$router->put('/admin/media/{id}', static function (Request $request, array $params) use ($adminGate): void {
    $adminGate($request);

    $id = (int) $params['id'];
    if (MediaRepo::find($id) === null) {
        Response::notFound('That image no longer exists.');
    }

    $v = new Validator($request->body());
    $altText = (string) ($v->string('altText', max: 500) ?? '');
    $v->stopIfFailed();

    MediaRepo::updateAlt($id, $altText);

    Response::ok(MediaRepo::find($id));
});

$router->delete('/admin/media/{id}', static function (Request $request, array $params) use ($adminGate): void {
    $adminGate($request);

    $id = (int) $params['id'];
    $item = MediaRepo::find($id);
    if ($item === null) {
        Response::notFound('That image no longer exists.');
    }

    // Refuse to orphan an image the live site is still pointing at, unless the
    // caller explicitly confirms after seeing the usage list.
    $usages = MediaRepo::usages((string) $item['path']);
    $force = filter_var($request->query('force', 'false'), FILTER_VALIDATE_BOOLEAN);

    if ($usages !== [] && !$force) {
        Response::error(
            409,
            'media_in_use',
            'This image is still used on the site. Replace it there first, or confirm to delete anyway.',
            ['usages' => implode(' • ', $usages)]
        );
    }

    $filename = MediaRepo::delete($id);
    if ($filename !== null) {
        Uploads::delete($filename);
    }

    Response::ok(['deleted' => true]);
});

// ---------------------------------------------------------------------------
// Admin — simple collections (dispensaries, articles, story sections/stats)
// ---------------------------------------------------------------------------

/**
 * Per-resource validation. Returns the cleaned, JSON-keyed payload that
 * CollectionRepo maps onto whitelisted columns.
 */
$validateCollection = static function (string $resource, Request $request, ?int $existingId): array {
    $v = new Validator($request->body());

    $data = match ($resource) {
        'dispensaries' => [
            'name'        => (string) $v->string('name', required: true, max: 191, label: 'dispensary name'),
            'location'    => (string) $v->string('location', required: true, max: 191, label: 'location'),
            'region'      => (string) $v->string('region', required: true, max: 120, label: 'region'),
            'websiteUrl'  => $v->url('websiteUrl'),
            'isPublished' => $v->bool('isPublished', true),
        ],
        'articles' => [
            'slug'        => (string) $v->slug('slug', required: true),
            'title'       => (string) $v->string('title', required: true, max: 255, label: 'headline'),
            'excerpt'     => (string) ($v->string('excerpt', max: 2000) ?? ''),
            'publishedOn' => $v->date('publishedOn'),
            'imageSrc'    => $v->url('imageSrc'),
            'imageAlt'    => (string) ($v->string('imageAlt', max: 500) ?? ''),
            'externalUrl' => $v->url('externalUrl'),
            'isPublished' => $v->bool('isPublished', true),
        ],
        'gallery' => [
            'imageSrc'    => (string) $v->url('imageSrc', required: true),
            'imageAlt'    => (string) ($v->string('imageAlt', max: 500) ?? ''),
            'caption'     => (string) ($v->string('caption', max: 191) ?? ''),
            'isPublished' => $v->bool('isPublished', true),
        ],
        'story-sections' => [
            'eyebrow'     => (string) ($v->string('eyebrow', max: 191) ?? ''),
            'heading'     => (string) $v->string('heading', required: true, max: 255, label: 'heading'),
            'body'        => (string) ($v->string('body', max: 8000) ?? ''),
            'imageSrc'    => $v->url('imageSrc'),
            'imageAlt'    => (string) ($v->string('imageAlt', max: 500) ?? ''),
            'isPublished' => $v->bool('isPublished', true),
        ],
        'story-stats' => [
            'value'       => (string) ($v->string('value', max: 100) ?? ''),
            'label'       => (string) $v->string('label', required: true, max: 191, label: 'caption'),
            'autoSource'  => $v->enum('autoSource', ['dispensary_count']),
            'isTextStyle' => $v->bool('isTextStyle'),
            'isPublished' => $v->bool('isPublished', true),
        ],
        default => [],
    };

    // Article slugs must stay unique — they form the public URL.
    if ($resource === 'articles' && ($data['slug'] ?? '') !== '') {
        $sql = 'SELECT id FROM articles WHERE slug = :slug';
        $params = ['slug' => $data['slug']];
        if ($existingId !== null) {
            $sql .= ' AND id <> :id';
            $params['id'] = $existingId;
        }
        if (Database::one($sql . ' LIMIT 1', $params) !== null) {
            $v->addError('slug', 'Another article already uses that web address.');
        }
    }

    if ($resource === 'story-stats' && ($data['value'] ?? '') === '' && ($data['autoSource'] ?? null) === null) {
        $v->addError('value', 'Enter a value, or choose an automatic source.');
    }

    $v->stopIfFailed();

    return $data;
};

$router->get('/admin/{resource}', static function (Request $request, array $params) use ($adminGate): void {
    // Authenticate before revealing whether a resource name exists.
    $adminGate($request);

    $resource = $params['resource'];
    if (!CollectionRepo::isKnown($resource)) {
        Response::notFound("Unknown resource: {$resource}");
    }

    Response::ok(CollectionRepo::all($resource, publishedOnly: false));
});

$router->post('/admin/{resource}', static function (Request $request, array $params) use ($adminGate, $validateCollection): void {
    // Authenticate before revealing whether a resource name exists.
    $adminGate($request);

    $resource = $params['resource'];
    if (!CollectionRepo::isKnown($resource)) {
        Response::notFound("Unknown resource: {$resource}");
    }

    $data = $validateCollection($resource, $request, null);
    $id = CollectionRepo::create($resource, $data);

    Response::json(['ok' => true, 'data' => CollectionRepo::find($resource, $id)], 201);
});

$router->put('/admin/{resource}/{id}', static function (Request $request, array $params) use ($adminGate, $validateCollection): void {
    // Authenticate before revealing whether a resource name exists.
    $adminGate($request);

    $resource = $params['resource'];
    if (!CollectionRepo::isKnown($resource)) {
        Response::notFound("Unknown resource: {$resource}");
    }

    $id = (int) $params['id'];
    if (CollectionRepo::find($resource, $id) === null) {
        Response::notFound('That item no longer exists.');
    }

    $data = $validateCollection($resource, $request, $id);
    CollectionRepo::update($resource, $id, $data);

    Response::ok(CollectionRepo::find($resource, $id));
});

$router->delete('/admin/{resource}/{id}', static function (Request $request, array $params) use ($adminGate): void {
    // Authenticate before revealing whether a resource name exists.
    $adminGate($request);

    $resource = $params['resource'];
    if (!CollectionRepo::isKnown($resource)) {
        Response::notFound("Unknown resource: {$resource}");
    }

    if (!CollectionRepo::delete($resource, (int) $params['id'])) {
        Response::notFound('That item no longer exists.');
    }

    Response::ok(['deleted' => true]);
});

$router->post('/admin/{resource}/reorder', static function (Request $request, array $params) use ($adminGate): void {
    // Authenticate before revealing whether a resource name exists.
    $adminGate($request);

    $resource = $params['resource'];
    if (!CollectionRepo::isKnown($resource)) {
        Response::notFound("Unknown resource: {$resource}");
    }

    $v = new Validator($request->body());
    $ids = $v->stringList('ids', maxItems: 500);
    $v->stopIfFailed();

    CollectionRepo::reorder($resource, array_map('intval', $ids));

    Response::ok(['reordered' => count($ids)]);
});

return $router;
