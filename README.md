# Noble Falafel

A one-page website for Noble Falafel, a 70s-style falafel cart in Murray Hill, New York. It's a class exercise from the AI Coding for Product & UX class, built with plain HTML, CSS, and JavaScript, with GSAP for the animation.

## What's on the page

- **Hero:** the headline "Falafel cart in Murray Hill", a live open or closed status, and a ringed photo circle that opens ring by ring as four rainbow stripes draw in behind it.
- **The whole menu:** pitas and plates, sides, and drinks, with prices.
- **Fried while you watch:** a ringed circle that plays a frying video, then steps through six photos on a timer, or on a tap.
- **Find the cart:** the address, opening hours, and a Google map in the same ringed circle.
- **Bring the cart to your party:** a catering coupon that arrives behind a stripe wipe and opens an email with the visitor's details filled in.
- **A cart, a fryer, fair prices:** the story, with a 1916 photo of a New York pushcart.
- **Footer:** "Noble Falafel" spelled in coloured bars that bounce up into place, contact details, and a newsletter signup.

## How it behaves

- **Open or closed, live:** the status line uses New York time, wherever the visitor is, and updates every minute. Open is marked with a green dot and closed with an X, so it reads without relying on colour. The cart is open Tuesday to Sunday, 10am to 9pm, and closed on Mondays.
- **Animation:** simple effects (hovers, presses, focus, the photo crossfade) are CSS. The sequences (the hero opening, the ringed circles, the coupon wipe, the footer bars, and the scroll reveals) are [GSAP](https://gsap.com/) timelines and ScrollTriggers. The circles, coupon, and footer bars replay each time they scroll back into view.
- **Reduced motion:** with the system's reduced-motion setting on, nothing animates, slides, or fades, the video stays still, and every section is shown at rest. This also takes effect if the setting changes while the page is open.
- **Phones:** the navbar becomes a dropdown of coloured links, and the layout stacks into one column.
- **Images:** each photo comes in sizes matched to where it's drawn, as AVIF with WebP and JPEG fallbacks, so phones download small files and retina desktops get sharp ones. The video is AV1, with H.264 for browsers that can't play AV1.
- **Without JavaScript:** everything is still readable. The status line shows the fixed hours instead of a live status.

## Files

```
index.html   the page
page.css     all styles: colour and type tokens first, then each section, then the tablet and phone layouts and the motion rules
page.js      the live status, the slideshow, the GSAP animation, the phone menu, the navbar highlight, and the two forms
img/         the photos, each in two or three sizes as AVIF, WebP, and JPEG, plus the frying video (AV1 and H.264) and its poster frame
```

There's no build step and no dependencies to install. The fonts (Shrikhand and Jost) load from Google Fonts, and GSAP 3.12.5 loads from cdnjs.

## Running it locally

Open `index.html` in a browser, or serve the folder so it behaves exactly as it would online:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000. The fonts, GSAP, and the map need an internet connection. Offline, the page still works, but without the animation or the map.

## Before going live

This is sample content written for the class, so a few things need replacing:

- **Address:** 123 Noble Street is fictional. The map and the Get Directions links point to the corner of East 35th Street and Lexington Avenue in Murray Hill instead.
- **Menu and prices:** written as samples.
- **Social links:** Instagram, TikTok, and Review Us on Google go nowhere yet. They're marked as placeholders in `index.html`.
- **Forms:** there's no form backend. The catering request and the newsletter signup open an email to catering@noblefalafel.com or dispatch@noblefalafel.com.
- **Photos:** these are open-licence stand-ins of other falafel, not Noble Falafel's own food.

## Picture credits

Every photo is CC0 or public domain, so none needs a credit. They're listed here so their sources are easy to find.

| File | Picture | Creator | Licence |
|---|---|---|---|
| `falafel-1-*` | [Falafel 1](https://commons.wikimedia.org/wiki/File:Falafel_1.JPG) | Miansari66 | CC0 |
| `falafel-in-istanbul-*` | [Falafel in Istanbul, Türkiye](https://commons.wikimedia.org/wiki/File:Falafel_in_Istanbul,_T%C3%BCrkiye.jpg) | Sezenkerem | CC0 |
| `falafel-platter-close-up-*` | [Close-up of falafel platter at Agasi, Lajpat Nagar, Delhi](https://commons.wikimedia.org/wiki/File:Close-up_of_falafel_platter_at_Agasi,_Lajpat_Nagar,_Delhi.jpg) | Contrapunctus-1 | CC0 |
| `falafel-before-frying-*` | [Falafel before frying](https://commons.wikimedia.org/wiki/File:Falafel_before_frying.JPG) | Miansari66 | CC0 |
| `falafel-and-hummus-*` | [Falafel and Homemade Hummus](https://commons.wikimedia.org/wiki/File:Falafel_and_Homemade_Hummus_-_Lavash_2024-09-11.jpg) | Andy Li | CC0 |
| `chickpeas-*` | [Chickpeas (1)](https://commons.wikimedia.org/w/index.php?curid=149576112) | Fumikas Sagisavas | CC0 |
| `hummus-and-pitta-*` | [Homemade hummus and pitta](https://commons.wikimedia.org/wiki/File:Homemade_hummus_and_pitta_-_Long_Man_Inn_2024-12-18.jpg) | Andy Li | CC0 |
| `syrian-pushcart-*` | [Syrian pushcart food vendor on New York City street](https://commons.wikimedia.org/wiki/File:Syrian_pushcart_food_vendor_on_New_York_City_street_LCCN2016646376.tif) | Bain News Service | Public domain |

The frying video is the one piece that requires a credit, which the page shows in its footer:

| File | Source | Creator | Licence |
|---|---|---|---|
| `falafel-frying-*` | Excerpt from [Amazing Falafel Shop in Tehran](https://commons.wikimedia.org/wiki/File:Amazing_Falafel_Shop_in_Tehran_-_IRAN_Street_Food_-_%D9%81%D9%84%D8%A7%D9%81%D9%84.webm) | Street Food Tourists | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |

The map is a Google Maps embed; map data © Google.
