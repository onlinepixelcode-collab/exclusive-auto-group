"""Builds the inner pages of the Exclusive Auto Group demo from one shared template.
Run:  python3 tools/build_pages.py   (from the project folder). index.html is hand-written.
Bump VER after changing CSS/JS so browsers fetch the new files."""
import os, json, datetime

ROOT = os.path.join(os.path.dirname(__file__), '..', 'site')
BASE = 'https://demo.pixelcode.co.za/exclusiveautogroup/'
VER = '66'
ARROW = '<svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true"><path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>'
ARROW_L = '<svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true" style="transform:rotate(180deg)"><path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>'


def page(fname, title, desc, body_page, main, scripts=()):
    extra = '\n'.join(f'<script src="assets/js/{s}?v={VER}" defer></script>' for s in scripts)
    html = f"""<!doctype html>
<html lang="en-ZA" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{BASE}{fname}">
<meta property="og:type" content="website"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{BASE}{fname}"><meta property="og:site_name" content="Exclusive Auto Group"><meta property="og:locale" content="en_ZA"><meta property="og:image" content="https://demo.pixelcode.co.za/exclusiveautogroup/assets/img/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Exclusive Auto Group logo">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://demo.pixelcode.co.za/exclusiveautogroup/assets/img/og-image.jpg">
<meta name="theme-color" content="#0A0A0A">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<script>(function(){{try{{var t=localStorage.getItem('eag-theme');if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.setAttribute('data-theme',t)}}catch(e){{}}}})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/main.css?v={VER}">
</head>
<body data-page="{body_page}">
<main id="main">
{main}
</main>
<script src="data/stock.js?v={VER}"></script>
<script src="data/inspections.js?v={VER}"></script>
<script src="assets/js/common.js?v={VER}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
{extra}
<script src="assets/js/chat.js?v={VER}" defer></script>
</body>
</html>
"""
    open(os.path.join(ROOT, fname), 'w').write(html)


def head(eyebrow, l1, l2, lede='', img=None, extra=''):
    lede_html = f'<p class="lede">{lede}</p>' if lede else ''
    if img:
        return f"""<section class="page-hero page-hero--img"><img src="assets/img/{img}" alt="" data-kenburns><div class="wrap reveal">
<span class="eyebrow">{eyebrow}</span><h1 class="h2"><span class="l1">{l1}</span><span class="l2">{l2}</span></h1>{lede_html}{extra}</div><span class="scroll-dot" aria-hidden="true"></span></section>"""
    return f"""<section class="page-hero"><div class="wrap reveal"><span class="eyebrow">{eyebrow}</span>
<h1 class="h2"><span class="l1">{l1}</span><span class="l2">{l2}</span></h1>{lede_html}{extra}</div></section>"""


CTA = """<section class="cta"><div class="wrap"><h2 class="h2 h2--sm reveal"><span class="l1">Book a test drive</span><span class="l2">Today</span></h2>
<div class="cta-clock reveal" data-clock aria-live="off"><span class="cc-label">Cape Town · live</span><div class="cc-time" aria-hidden="true"></div><span class="sr-only cc-sr"></span><span class="cc-date"></span><span class="cc-status" data-hours-status></span></div>
<a class="btn reveal" href="contact.html?type=test-drive" data-track="cta_test_drive">Schedule test drive</a></div></section>"""

CONSENT = '<label class="check"><input type="checkbox" name="consent" required> I agree that Exclusive Auto Group may use these details to respond to my request, as set out in the <a href="privacy.html" style="text-decoration:underline">privacy policy</a> (POPIA).</label>'
CONTACT_FIELDS = """<div class="form-grid">
<label>Full name<input name="name" autocomplete="name" required></label>
<label>Mobile number<input name="phone" type="tel" autocomplete="tel" required inputmode="tel"></label></div>
<label>Email<input name="email" type="email" autocomplete="email"></label>"""


def side(items):
    return '<ul class="side-list">' + ''.join(f'<li><span class="n">0{i+1}</span><div><b>{t}</b><span>{d}</span></div></li>' for i, (t, d) in enumerate(items)) + '</ul>'


def grp(title, inner, open_=True):
    return f'<details class="fx-group" {"open" if open_ else ""}><summary>{title}</summary><div class="fx-body">{inner}</div></details>'


def choice(name, opts):
    return '<div class="choices">' + ''.join(
        f'<label class="choice"><input type="radio" name="{name}" value="{v}" {"required" if i == 0 else ""}><b>{v}</b><span>{d}</span></label>'
        for i, (v, d) in enumerate(opts)) + '</div>'


# ---------- inventory: detailed filter sidebar ----------
FILTERS = (
    grp('Make', '<div id="fx-make" class="fx-list"></div>')
    + grp('Body type', '<div id="fx-body" class="fx-pills"></div>')
    + grp('Price', '<div class="fx-range"><output id="o-price"></output><label><span class="sr-only">Minimum price</span><input type="range" id="fx-pmin"></label><label><span class="sr-only">Maximum price</span><input type="range" id="fx-pmax"></label></div>')
    + grp('Year', '<div class="fx-two"><label><span class="sr-only">Year from</span><select id="fx-ymin"></select></label><label><span class="sr-only">Year to</span><select id="fx-ymax"></select></label></div>')
    + grp('Mileage', '<div class="fx-range"><output id="o-km"></output><label><span class="sr-only">Maximum mileage</span><input type="range" id="fx-km" min="0"></label></div>')
    + grp('Fuel', '<div id="fx-fuel" class="fx-list"></div>', False)
    + grp('Gearbox', '<div id="fx-trans" class="fx-list"></div>', False)
    + grp('Engine', '<div id="fx-engine" class="fx-list"></div>', False)
)
page('inventory.html', 'Luxury & Performance Used Cars for Sale in Cape Town | Exclusive Auto Group',
     'Browse every car in stock at Exclusive Auto Group, N1 City: Lamborghini, McLaren, Porsche, Mercedes-AMG, BMW M, Bentley and more. Filter by make, body, price, year, mileage and engine.',
     'inventory',
     head('In the lot now', 'All', 'Inventory', img='hero-1-showroom.jpg', extra='<div class="count-pill"><b id="inv-total">0</b> vehicles in stock</div>') + f"""
<section class="inv sec--alt"><div class="wrap inv-layout">
 <aside class="filter-side" id="filter-side" aria-label="Filters">
  <form>
   <div class="fx-head"><b>Filters</b><button type="button" class="fx-clear" data-clear>Clear all</button><button type="button" class="fx-x" data-close-filters aria-label="Close filters">×</button></div>
   <label class="fx-search"><span class="sr-only">Search</span><input id="fx-q" type="search" placeholder="Search model, e.g. G63, CSL, Raptor"></label>
   <div class="fx-presets"><button type="button" data-preset="supercars">Supercars</button><button type="button" data-preset="suv">SUVs</button><button type="button" data-preset="under1m">Under R1m</button><button type="button" data-preset="low-km">Low km</button><button type="button" data-preset="v8">V8</button><button type="button" data-preset="bakkie">Bakkies</button></div>
   {FILTERS}
   <button type="button" class="btn btn--solid btn--block fx-done" data-close-filters>Show <span id="fx-open-count">0</span> cars</button>
  </form>
 </aside>
 <div class="inv-main">
  <div class="inv-bar"><button type="button" class="btn fx-open" id="fx-open" aria-expanded="false" aria-controls="filter-side">Filters</button>
   <span class="tiny" id="inv-count" aria-live="polite"></span>
   <label class="inv-sort"><span class="tiny">Sort</span><select id="fx-sort"><option value="newest">Newest arrivals</option><option value="price-desc">Price: high to low</option><option value="price-asc">Price: low to high</option><option value="km-asc">Lowest mileage</option><option value="year-desc">Newest model year</option><option value="kw-desc">Most powerful</option></select></label></div>
  <div class="active-chips" id="active-chips"></div>
  <div class="grid-cards" id="inv-grid"></div>
  <p class="form-note" style="margin-top:32px">Engine and power figures are manufacturer specifications for the model; confirm the exact car with our sales team.</p>
 </div>
</div></section>
<div class="filter-scrim" data-close-filters></div>""" + CTA,
     scripts=['inventory.js'])

# ---------- brands ----------
page('brands.html', 'Car Brands in Stock | Lamborghini, McLaren, Porsche, AMG, BMW M | Exclusive Auto Group',
     'Every marque in stock at Exclusive Auto Group, Cape Town: Lamborghini, McLaren, Porsche, Bentley, Mercedes-AMG, BMW M, Land Rover, Toyota and more.',
     'brands',
     head('The lineup', 'Our', 'Brands', 'From Italian supercars to Hilux bakkies. Every marque we have in stock today, hand-picked and ready to view.', img='hero-2-revuelto.jpg', extra='<div class="count-pill"><b id="brand-count">0</b> marques in stock</div>') + """
<section class="sec sec--black"><div class="wrap"><div class="brand-wall" id="brand-wall"></div>
<div class="brand-more reveal"><p class="lede" style="margin:0">Looking for a marque that isn't here? If we don't have your vehicle, we will find it for you.</p><a class="btn" href="find.html">Find my ride</a></div></div></section>""" + CTA,
     scripts=['pages.js'])

# ---------- car detail: gallery, scroll-driven story, specs ----------
page('car.html', 'Car details | Exclusive Auto Group', 'Vehicle details, photos and specs at Exclusive Auto Group, Cape Town.', 'car', f"""
<section class="film film--hero" id="film" aria-label="The story of this car. Scroll to play.">
 <div class="film-stage"><canvas id="film-canvas" aria-hidden="true"></canvas><div class="film-shade"></div>
  <div class="film-title wrap"><span class="tiny" id="film-crumb"><a href="inventory.html">Inventory</a> / <span id="film-crumb-car"></span></span><h1 id="car-h1"></h1><div class="film-price" id="film-price"></div></div>
  <div class="film-caption"><span class="eyebrow" id="film-eyebrow"></span><div class="film-big" id="film-big"></div><p class="film-text" id="film-text"></p></div>
  <ol class="film-chapters" id="film-chapters" aria-hidden="true"></ol>
  <div class="film-meta"><span id="film-count">01</span><i class="film-line"><b id="film-prog"></b></i><span>Scroll</span></div>
  <span class="scroll-dot" aria-hidden="true"></span>
 </div>
</section>
<section class="sec sec--black" style="padding-top:72px"><div class="wrap detail">
 <div>
  <span class="eyebrow">Specification</span><h2 class="h3">Key details</h2>
  <dl class="spec-grid" id="spec-grid"></dl>
  <span class="eyebrow">Features &amp; history</span><h2 class="h3">What's included</h2>
  <ul class="features" id="features"></ul>
  <div class="trade-cta insp-cta reveal"><div><span class="eyebrow">Inspection</span><h2 class="h3">Full inspection report on request</h2><p class="lede" style="margin-top:8px">Ask for the full condition report and service book before you view.</p></div><a class="btn" id="insp-link" href="contact.html?type=enquiry" data-track="inspection_request">Request the report</a></div>
  <div class="trade-cta reveal"><div><span class="eyebrow">Trade-in</span><h2 class="h3">Trading in your car?</h2><p class="lede" style="margin-top:8px">Get a fair value in five quick steps and put it towards this one.</p></div><a class="btn btn--solid" id="trade-link" href="sell.html">Value my car</a></div>
 </div>
 <aside class="sticky-panel" id="panel" aria-label="Price and enquiry"></aside>
</div></section>
<section class="car-strip" aria-label="All photos of this car">
 <div class="wrap car-strip-head"><div><span class="eyebrow">Every angle</span><h2 class="h2 h2--sm"><span class="l1">The full</span><span class="l2">Gallery</span></h2></div><span class="tiny" id="strip-count"></span></div>
 <div class="car-strip-row" id="car-strip"></div>
</section>
<section class="dash-sec" aria-label="Instrument cluster"><div class="wrap"><div class="dash" id="dash"></div></div></section>
<section class="sec sec--navy"><div class="wrap"><div class="sec-head"><div><span class="eyebrow">You may also like</span><h2 class="h2 h2--sm"><span class="l1">Similar</span><span class="l2">Cars</span></h2></div>
<div class="car-nav" id="sim-nav"><button type="button" class="round-btn" id="sim-prev" aria-label="Previous cars">{ARROW_L}</button><span class="car-nav-count" id="sim-count">01 / 01</span><button type="button" class="round-btn" id="sim-next" aria-label="Next cars">{ARROW}</button></div></div>
<div class="carousel" id="similar-carousel" aria-roledescription="carousel" aria-label="Similar cars"><div class="carousel-track" id="similar"></div></div>
<div class="carousel-foot"><div class="carousel-progress" id="sim-foot"><i id="sim-bar"></i></div><a class="link-arrow" href="inventory.html">View all inventory {ARROW}</a></div></div></section>
<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Photo viewer"><button type="button" class="lb-x" aria-label="Close">×</button><button type="button" class="lb-prev" aria-label="Previous photo">{ARROW_L}</button><img alt=""><button type="button" class="lb-next" aria-label="Next photo">{ARROW}</button><span class="lb-count"></span></div>""" + CTA,
     scripts=['car.js'])

# ---------- sell / trade-in: step-by-step ----------
STEPS = ['Your car', 'Condition', 'Photos', 'Your details', 'Review']
NEXT = lambda label: f'<button type="button" class="btn btn--solid" data-next>{label} {ARROW}</button>'
BACK = '<button type="button" class="btn" data-prev>Back</button>'
page('sell.html', 'Sell or Trade In Your Car in Cape Town | Exclusive Auto Group',
     'Get a fair value for your current car in five quick steps. All trade-ins welcome at Exclusive Auto Group, N1 City, Goodwood.',
     'sell',
     head('Sell / trade-in', 'Value', 'my car', 'Five quick steps. Our buyers come back with a fair, market-related figure, usually the same business day.', img='rear-720s.jpg') + f"""
<section class="sec sec--black"><div class="wrap wz-wrap">
 <aside class="wz-aside reveal">
  <span class="eyebrow" id="wz-count">Step 1 of 5</span>
  <div class="wz-bar"><i></i></div>
  <ol class="wz-progress">{''.join(f'<li><span>0{i+1}</span>{t}</li>' for i, t in enumerate(STEPS))}</ol>
  <p class="form-note" style="margin-top:28px">All trade-ins welcome, financed or paid off. Your details are only used to value your car (POPIA).</p>
 </aside>
 <form class="form wz" id="sell-wizard" novalidate>
  <input type="hidden" name="interested_in">
  <fieldset class="wz-step"><legend class="h3">Tell us about your car</legend>
   <div class="form-grid"><label>Make<input name="make" required placeholder="e.g. Mercedes-Benz" autocomplete="off"></label><label>Model &amp; derivative<input name="model" required placeholder="e.g. C63 S Coupe"></label></div>
   <div class="form-grid"><label>Year<input name="year" inputmode="numeric" pattern="(19|20)[0-9]{{2}}" required placeholder="e.g. 2019"></label><label>Mileage (km)<input name="mileage" inputmode="numeric" required placeholder="e.g. 65 000"></label></div>
   <label>Colour<input name="colour" placeholder="e.g. Obsidian black"></label>
   <div class="wz-nav"><span></span>{NEXT('Next: condition')}</div></fieldset>
  <fieldset class="wz-step" hidden><legend class="h3">How is it looking?</legend>
   <span class="tiny">Overall condition</span>{choice('condition', [('Excellent', 'Like new, no marks'), ('Good', 'Light wear for its age'), ('Fair', 'Some marks or repairs needed')])}
   <div class="form-grid"><label>Service history<select name="service_history"><option>Full service history (agents)</option><option>Full service history (independent)</option><option>Partial</option><option>None</option></select></label>
   <label>Accident history<select name="accidents"><option>None</option><option>Minor, repaired</option><option>Major</option></select></label></div>
   <label>Finance outstanding on your car?<select name="finance_outstanding"><option>No, fully paid</option><option>Yes</option><option>Not sure</option></select></label>
   <label>Extras, modifications or damage<textarea name="notes" placeholder="e.g. Ceramic coating, PPF, new tyres, small scratch on rear bumper"></textarea></label>
   <div class="wz-nav">{BACK}{NEXT('Next: photos')}</div></fieldset>
  <fieldset class="wz-step" hidden><legend class="h3">Add a few photos</legend>
   <p class="form-note">Front, rear, both sides, interior and the odometer. Photos help us give a sharper figure. You can skip this.</p>
   <label class="drop"><input type="file" name="photos" accept="image/*" multiple><span><b>Choose photos</b> or drag them here</span></label>
   <div class="wz-previews" id="wz-previews"></div>
   <div class="wz-nav">{BACK}{NEXT('Next: your details')}</div></fieldset>
  <fieldset class="wz-step" hidden><legend class="h3">Where do we send the figure?</legend>
   {CONTACT_FIELDS}
   <span class="tiny">What would you like to do?</span>{choice('plan', [('Trade in', 'Put it towards another car'), ('Sell outright', 'We simply buy it'), ('Not sure yet', 'Show me the options')])}
   {CONSENT}
   <div class="wz-nav">{BACK}{NEXT('Review')}</div></fieldset>
  <fieldset class="wz-step" hidden><legend class="h3">Check and send</legend>
   <dl class="wz-review" id="wz-review"></dl>
   <button type="button" class="link-arrow" data-goto="0" style="min-height:40px">Edit details</button>
   <div class="wz-nav">{BACK}<button type="submit" class="btn btn--solid">Get my valuation</button></div></fieldset>
 </form>
</div></section>""" + CTA,
     scripts=['pages.js'])

# ---------- find my ride ----------
page('find.html', 'Find My Ride — Vehicle Sourcing | Exclusive Auto Group',
     "If we don't have your vehicle, we will find it for you. Tell us what you want and our sourcing team gets to work.",
     'find',
     head("We'll find it for you", 'Find', 'my ride', "If we don't have your vehicle, we will find it for you. Tell us exactly what you want and our sourcing team gets to work.", img='caliper-huracan.jpg') + """
<section class="sec sec--black"><div class="wrap form-wrap">
 <div class="reveal"><span class="eyebrow">Sourcing</span><h2 class="h2 h2--sm"><span class="l1">Your spec,</span><span class="l2">Our network</span></h2>""" + side([('Brief us', 'Model, year, colour, budget and must-have extras.'), ('We search', 'Our dealer and private network across South Africa.'), ('You approve', 'Photos, history and a fair price before you commit.')]) + """</div>
 <form class="form reveal" id="find-form">
  <div class="form-grid"><label>Make<input name="make" required placeholder="e.g. Porsche"></label><label>Model<input name="model" required placeholder="e.g. 911 GT3"></label></div>
  <div class="form-grid"><label>Year from<input name="year_from" inputmode="numeric" placeholder="e.g. 2020"></label><label>Max budget<input name="budget" placeholder="e.g. R3.5m"></label></div>
  <div class="form-grid"><label>Colour<input name="colour" placeholder="e.g. Chalk / any"></label><label>When do you need it?<select name="timeline"><option>As soon as possible</option><option>Within 1 month</option><option>1–3 months</option><option>Just browsing</option></select></label></div>
  <label>Must-have extras<textarea name="extras" placeholder="e.g. Sport Chrono, carbon buckets, low mileage"></textarea></label>
  """ + CONTACT_FIELDS + CONSENT + """<button class="btn btn--solid" type="submit">Start my search</button></form>
</div></section>""" + CTA,
     scripts=['pages.js'])

# ---------- about: editorial ----------
page('about.html', 'About Exclusive Auto Group | Cape Town Since 2014',
     "Exclusive Auto Group has been Cape Town's home for premium and performance pre-owned cars since 2014. Meet the team at N1 City, Goodwood.",
     'about', f"""
<section class="about-hero"><img src="assets/img/hero-2-revuelto.jpg" alt="Lamborghini Revuelto with doors raised in the Exclusive Auto Group showroom" data-kenburns>
 <div class="wrap reveal"><span class="eyebrow">About us · Since 2014</span><h1 class="h2 about-title"><span class="l1">Exclusive,</span><span class="l2">by nature.</span></h1></div>
 <span class="scroll-dot" aria-hidden="true"></span></section>

<section class="sec sec--black manifesto-sec"><div class="wrap">
 <span class="eyebrow reveal">Our philosophy</span>
 <p class="manifesto" data-words>We don't sell cars by the hundred. We choose them one at a time, check every detail, and hand over the keys as if they were our own.</p>
</div></section>

<section class="about-split"><div class="about-split-media"><img src="assets/img/hero-1-showroom.jpg" alt="Lamborghini Huracán in the Exclusive Auto Group showroom, N1 City" loading="lazy" data-parallax></div>
 <div class="about-split-copy"><div class="reveal"><span class="eyebrow">The story</span><h2 class="h2 h2--sm"><span class="l1">Pivot Square,</span><span class="l2">N1 City</span></h2>
 <p class="lede">Exclusive Auto Group opened in 2014 with a simple idea: buying a special car should feel special. Owner Keegan Matthews built the business around a hand-picked floor, honest advice and a showroom you'd want to spend time in.</p>
 <p class="lede">Today the floor runs from Hilux Legends and family SUVs to Lamborghini, McLaren and Porsche, with every trade-in welcome and delivery anywhere in South Africa.</p></div></div></section>

<section class="stat-band"><div class="wrap stat-band-row">
 <div class="reveal"><b>2014</b><span>Established in Cape Town</span></div>
 <div class="reveal" data-delay=".08"><b id="about-count" data-count>87</b><span>Cars on the floor today</span></div>
 <div class="reveal" data-delay=".16"><b data-count>9</b><span>Provinces we deliver to</span></div>
 <div class="reveal" data-delay=".24"><b id="about-marques" data-count>18</b><span>Marques in stock</span></div>
</div></section>

<section class="sec sec--navy"><div class="wrap">
 <div class="sec-head reveal"><div><span class="eyebrow">What we stand for</span><h2 class="h2 h2--sm"><span class="l1">The Exclusive</span><span class="l2">Standard</span></h2></div></div>
 <div class="pillars">
  <article class="pillar reveal"><span class="pillar-img"><img src="assets/img/detail-720s.jpg" alt="" loading="lazy"></span><span class="service-num">01</span><h3>Curated, not stocked</h3><p>Every car is chosen by hand for its history, spec and condition. If it doesn't meet our standard, it doesn't reach the floor.</p></article>
  <article class="pillar reveal" data-delay=".08"><span class="pillar-img"><img src="assets/img/interior-911.jpg" alt="" loading="lazy"></span><span class="service-num">02</span><h3>Transparent by default</h3><p>Service books, history and honest answers up front. What you see in the listing is what you drive home.</p></article>
  <article class="pillar reveal" data-delay=".16"><span class="pillar-img"><img src="assets/img/rear-911.jpg" alt="" loading="lazy"></span><span class="service-num">03</span><h3>Personal, start to finish</h3><p>One point of contact from first viewing to handover, and long after. Buying from us is the start of a relationship.</p></article>
 </div>
</div></section>

<section class="sec sec--black" id="team"><div class="wrap">
 <div class="sec-head reveal"><div><span class="eyebrow">The people</span><h2 class="h2 h2--sm"><span class="l1">Meet the</span><span class="l2">Team</span></h2></div><a class="link-arrow" href="contact.html">Contact the team {ARROW}</a></div>
 <div class="team">
  <article class="member reveal"><span class="member-img"><img src="assets/img/revuelto-front.jpg" alt="" loading="lazy"></span><div class="member-body"><span class="eyebrow">Owner &amp; founder</span><b>Keegan Matthews</b><p>Founded Exclusive Auto Group in 2014 and still chooses the cars that go on the floor.</p><a class="link-arrow" href="mailto:Keegan@exclusiveag.co.za">Email Keegan {ARROW}</a></div></article>
  <article class="member reveal" data-delay=".1"><span class="member-img"><img src="assets/img/rear-720s.jpg" alt="" loading="lazy"></span><div class="member-body"><span class="eyebrow">Sales manager</span><b>Ridah Jappie</b><p>Leads the sales team, from first viewing and paperwork to delivery day.</p><a class="link-arrow" href="contact.html">Contact sales {ARROW}</a></div></article>
 </div>
</div></section>

<section class="h-strip" aria-label="Inside the showroom"><div class="h-strip-head wrap"><span class="eyebrow">Inside the showroom</span><span class="tiny">Scroll</span></div><div class="h-strip-track" id="about-strip"></div></section>

<section class="delivery" id="delivery">
 <div class="wrap delivery-grid">
  <div class="delivery-copy reveal">
   <span class="eyebrow">Nationwide delivery</span>
   <h2 class="h2 h2--sm"><span class="l1">Anywhere in</span><span class="l2">South Africa</span></h2>
   <p class="lede">Buy from Johannesburg, Durban or Polokwane without leaving home. We send a detailed video walk-around, handle the paperwork digitally and deliver to your door by enclosed transport.</p>
   <div class="dm-ticker" id="dm-ticker" aria-live="polite"><span class="dm-live"></span>Delivering from N1 City, Cape Town</div>
   <label class="dm-pick"><span class="tiny">Where should we deliver?</span><select id="dm-select"></select></label>
   <div class="dm-result" id="dm-result" aria-live="polite"></div>
   <a class="btn btn--solid" id="dm-cta" href="contact.html?type=delivery" data-track="delivery_enquiry">Ask about delivery</a>
   <ul class="dm-steps"><li><b>01</b>Video walk-around</li><li><b>02</b>Digital paperwork</li><li><b>03</b>Enclosed delivery</li></ul>
  </div>
  <div class="delivery-map" id="delivery-map"></div>
 </div>
</section>

<section class="sec sec--black" id="reviews"><div class="wrap" style="text-align:center"><span class="eyebrow reveal">Reviews</span>
 <h2 class="h2 h2--sm reveal"><span class="l1">What our</span><span class="l2">Clients say</span></h2>
 <p class="lede reveal" style="margin:22px auto 32px">Read what our customers say on Google, and see recent handovers on Instagram.</p>
 <div class="reveal" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn btn--solid" href="https://www.google.com/search?q=Exclusive+Auto+Group+Goodwood+reviews" target="_blank" rel="noopener">Google reviews</a><a class="btn" href="https://www.instagram.com/exclusive.auto.group" target="_blank" rel="noopener">@exclusive.auto.group</a></div>
</div></section>""" + CTA,
     scripts=['pages.js', 'sa-map.js', 'delivery.js'])

# ---------- contact ----------
page('contact.html', 'Contact & Book a Viewing | Exclusive Auto Group, N1 City Cape Town',
     'Visit Exclusive Auto Group at 6 Manus Gerber Street, Pivot Square, N1 City, Goodwood. Call +27 87 896 9192, book a viewing or test drive online.',
     'contact',
     head('Get in touch', 'Visit', 'the showroom', '6 Manus Gerber Street, Pivot Square, N1 City, Goodwood, Cape Town, 7460', img='revuelto-front.jpg') + """
<section class="sec sec--black"><div class="wrap form-wrap">
 <div class="reveal">
  <ul class="side-list" style="margin-top:0">
   <li><span class="n">01</span><div><b>Call</b><span><a href="tel:+27878969192">+27 87 896 9192</a></span></div></li>
   <li><span class="n">02</span><div><b>Email</b><span><a href="mailto:Keegan@exclusiveag.co.za">Keegan@exclusiveag.co.za</a></span></div></li>
   <li><span class="n">03</span><div><b>WhatsApp</b><span><a href="#" class="js-wa">Message the sales team</a></span></div></li>
  </ul>
  <div class="hours-card"><span class="eyebrow">Sales hours</span><div data-hours></div></div>
  <div class="map"><iframe title="Map to Exclusive Auto Group" src="https://www.google.com/maps?q=6+Manus+Gerber+Street,+Goodwood,+Cape+Town,+7460&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
 </div>
 <form class="form reveal" id="contact-form">
  <label>I'd like to<select name="request" id="c-type"><option value="Enquiry">Make an enquiry</option><option value="Viewing">Book a viewing</option><option value="Test drive">Book a test drive</option><option value="Delivery">Ask about delivery</option></select></label>
  <label>Car (optional)<select name="vehicle" id="c-car"><option value="">Not sure yet</option></select></label>
  <fieldset class="slots"><legend>Pick a viewing time <span class="tiny">Cape Town time</span></legend>
   <div class="slot-days" id="slot-days" role="listbox" aria-label="Choose a day"></div>
   <div class="slot-times" id="slot-times" role="listbox" aria-label="Choose a time"></div>
   <p class="slot-sum" id="slot-sum" aria-live="polite">Choose a day and time. We'll confirm by phone or WhatsApp.</p>
   <input type="hidden" name="date" id="c-date"><input type="hidden" name="time" id="c-time">
  </fieldset>
  """ + CONTACT_FIELDS + """<label>Message<textarea name="message" placeholder="Anything we should know"></textarea></label>
  """ + CONSENT + """<button class="btn btn--solid" type="submit">Send request</button></form>
</div></section>""",
     scripts=['pages.js'])

# ---------- privacy ----------
page('privacy.html', 'Privacy Policy (POPIA) | Exclusive Auto Group', 'How Exclusive Auto Group collects, uses and protects your personal information under POPIA.', 'privacy',
     head('Legal', 'Privacy', 'policy', 'Last updated ' + datetime.date.today().strftime('%d %B %Y')) + """
<section class="sec sec--black" style="padding-top:0"><div class="wrap legal">
<p><strong>Demo notice:</strong> this policy is a starting template prepared for a website demo and should be reviewed by Exclusive Auto Group before going live.</p>
<h2 class="h3">1. Who we are</h2><p>Exclusive Auto Group ("we", "us") is the responsible party for personal information collected through this website. Address: 6 Manus Gerber Street, Pivot Square, N1 City, Goodwood, Cape Town, 7460. Email: Keegan@exclusiveag.co.za. Phone: +27 87 896 9192.</p>
<h2 class="h3">2. What we collect</h2><p>Information you give us in forms and the Valet chat: your name, phone number, email, the vehicle you are interested in, trade-in details and photos, and messages. We also collect basic technical data (pages visited, device type) through cookies if you allow analytics.</p>
<h2 class="h3">3. Why we use it</h2><p>To respond to your enquiry, arrange viewings and test drives, value trade-ins and source vehicles. We use analytics only to improve the website. We do not sell your information.</p>
<h2 class="h3">4. Sharing</h2><p>We share information only as needed: with delivery partners (for vehicle delivery) and service providers who host this website, all bound to protect it.</p>
<h2 class="h3">5. Cookies</h2><p>Essential cookies keep the site working (for example your theme choice). Analytics cookies are used only if you click "Accept all". You can change your choice by clearing this site's data in your browser.</p>
<h2 class="h3">6. Your rights</h2><p>Under the Protection of Personal Information Act (POPIA) you may ask to see, correct or delete your information, object to processing, or withdraw consent. Contact us at the details above. You may also lodge a complaint with the Information Regulator (inforegulator.org.za).</p>
<h2 class="h3">7. Security and retention</h2><p>We take reasonable technical and organisational measures to protect your information and keep it only as long as needed for the purpose it was collected, or as the law requires.</p>
</div></section>""")



# ---------- my garage ----------
page('garage.html', 'My Garage — Saved Cars | Exclusive Auto Group', 'Your saved cars at Exclusive Auto Group. Build a shortlist, compare and share it.', 'garage',
     head('Saved cars', 'My', 'Garage', 'Your shortlist lives here. Compare favourites, share it on WhatsApp or ask us about all of them at once.', extra='<div class="count-pill"><b id="garage-count">0</b> saved</div>') + """
<section class="sec sec--alt" style="padding-top:48px"><div class="wrap">
 <div class="garage-note" id="garage-note" hidden></div>
 <div class="garage-bar" id="garage-bar" hidden></div>
 <div class="grid-cards" id="garage-grid"></div>
 <p class="form-note" style="margin-top:28px">Your garage is saved on this device. Use "Copy link" or WhatsApp to open it anywhere.</p>
</div></section>""" + CTA, scripts=['garage.js'])

# ---------- compare ----------
page('compare.html', 'Compare Cars Side by Side | Exclusive Auto Group', 'Compare up to three cars from our stock side by side: price, year, mileage, engine and power.', 'compare',
     head('Side by side', 'Compare', 'Cars', 'Pick up to three cars and see how they stack up. Then race their rev counters.') + """
<section class="sec sec--black" style="padding-top:24px"><div class="wrap"><div class="cmp" id="cmp"></div>
<p class="form-note" style="margin-top:24px">The race is a bit of fun based on each car's power figure, not a timed test. Best-in-row values are highlighted.</p></div></section>""" + CTA, scripts=['compare.js'])

# ---------- terms & conditions ----------
page('terms.html', 'Terms & Conditions | Exclusive Auto Group', 'Terms and conditions for using the Exclusive Auto Group website and enquiring about vehicles.', 'terms',
     head('Legal', 'Terms &amp;', 'conditions', 'Last updated ' + datetime.date.today().strftime('%d %B %Y')) + """
<section class="sec sec--black" style="padding-top:0"><div class="wrap legal">
<p><strong>Demo notice:</strong> these terms are a starting template prepared for a website demo and should be reviewed by Exclusive Auto Group and its legal adviser before going live.</p>
<h2 class="h3">1. About these terms</h2><p>This website is operated by Exclusive Auto Group, 6 Manus Gerber Street, Pivot Square, N1 City, Goodwood, Cape Town, 7460 ("we", "us"). By using the site you agree to these terms. If you do not agree, please do not use the site.</p>
<h2 class="h3">2. Vehicle information and pricing</h2><p>We take care to keep listings accurate, but vehicle details, specifications, mileage, features, photos and prices are provided for information only and may contain errors or change without notice. Engine and power figures are manufacturer specifications for the model. Prices are in South African Rand and include VAT where applicable. Licensing, registration and delivery costs may be extra. Please confirm all details with our sales team before buying.</p>
<h2 class="h3">3. Availability</h2><p>Vehicles are offered subject to prior sale. A listing on this website is an invitation to enquire, not an offer to sell. A vehicle is only reserved once we confirm it in writing.</p>
<h2 class="h3">4. Buying a vehicle</h2><p>Every sale is governed by a written offer to purchase or sale agreement signed by both parties, which takes precedence over anything on this website. Your rights under the Consumer Protection Act 68 of 2008 are not affected by these terms.</p>
<h2 class="h3">5. Trade-in valuations and vehicle sourcing</h2><p>Valuations given online, by phone or through the Valet assistant are indicative and depend on a physical inspection of the vehicle and its documents. Requests to find a vehicle are handled on a best-effort basis and do not oblige either party to buy or sell.</p>
<h2 class="h3">6. Test drives and viewings</h2><p>Test drives are by appointment and subject to a valid driver's licence, identity verification and our insurance requirements. We may decline a test drive at our discretion.</p>
<h2 class="h3">7. The Valet assistant</h2><p>Valet is an automated assistant that helps you search our stock and send enquiries. Its answers are for guidance only; our sales team confirms all prices, availability and details.</p>
<h2 class="h3">8. Intellectual property</h2><p>The content on this website, including photos, text and the Exclusive Auto Group name and logo, belongs to us or our licensors. Vehicle manufacturer names and logos are the trademarks of their owners and are used only to identify the vehicles we sell. You may not copy or reuse our content without permission.</p>
<h2 class="h3">9. Links to other websites</h2><p>Links to third-party websites (for example Google Maps, Instagram or Facebook) are provided for convenience. We are not responsible for their content or privacy practices.</p>
<h2 class="h3">10. Liability</h2><p>To the extent the law allows, we are not liable for any loss arising from your use of this website or reliance on its content. Nothing in these terms limits liability that cannot be limited under South African law.</p>
<h2 class="h3">11. Privacy</h2><p>How we handle your personal information is set out in our <a href="privacy.html" style="text-decoration:underline">privacy policy</a> (POPIA).</p>
<h2 class="h3">12. Governing law and contact</h2><p>These terms are governed by the laws of the Republic of South Africa. Questions? Email Keegan@exclusiveag.co.za or call +27 87 896 9192.</p>
</div></section>""")

# ---------- sitemap + robots ----------
stock = json.loads(open(os.path.join(ROOT, 'data', 'stock.js')).read().split('window.EAG_STOCK=', 1)[1].rstrip().rstrip(';'))
urls = ['', 'inventory.html', 'brands.html', 'compare.html', 'sell.html', 'find.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html'] + [f'car.html?id={c["id"]}' for c in stock]
today = datetime.date.today().isoformat()
open(os.path.join(ROOT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(f'  <url><loc>{BASE}{u.replace("&", "&amp;")}</loc><lastmod>{today}</lastmod></url>' for u in urls) + '\n</urlset>\n')
open(os.path.join(ROOT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n')
print('built pages +', len(urls), 'sitemap urls')
