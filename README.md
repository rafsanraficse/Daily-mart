# DailyMart — Daily essentials storefront

A responsive, beginner-friendly e-commerce storefront demo using plain HTML, CSS, and JavaScript.

## Features
- Product cards with sample daily essentials and prices in Bangladeshi taka (৳)
- Search by product name/category/unit
- Category filters and sorting
- Cart drawer with quantity controls, item removal, subtotal and total
- Checkout form preview with required fields and a clear demo-only notice
- Responsive layout for phones, tablets, and computers
- Cart saved in this browser with localStorage
- Central product catalog in one editable file (`products.js`)

## Edit products in one place
All catalog items live in `/products.js`.

Each product uses clear field names:
- `name` (product title)
- `price` (number in taka)
- `description` (short text shown on the card)
- `category` (used for category filters)
- `image` (image URL)

Optional fields:
- `unit` (example: `1 kg`, `500 ml`)
- `badge` (small label on card)
- `alt` (image accessibility text)

To add a product, copy one product object in `products.js`, paste it, and update values.
To remove a product, delete that product object.
To edit a product, change its fields and refresh the page.

## Run it
**Easiest:** open `index.html` in a browser.

For a more reliable local preview, use a simple static server or deploy the files using GitHub Pages.

## Important demo limitations
This is a front-end demo. It does **not**:
- take real payments
- submit orders to a business
- maintain real inventory
- send confirmation emails/SMS
- provide customer accounts or an admin dashboard
- securely store customer details

Before selling real products, connect a backend/order database, server-side validation, secure authentication where needed, and a payment provider appropriate for Bangladesh. Never put secret payment keys in browser JavaScript.

Product prices and imagery are examples and should be verified/replaced before launch. Product images are loaded from Unsplash URLs and therefore require an internet connection.

## Publish with GitHub Pages
1. Create a repository on GitHub named `dailymart`.
2. Upload `index.html`, `styles.css`, `script.js`, and `README.md` to the repository root.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/(root)`, then save.
6. Wait for GitHub Pages to publish and open the URL shown on the Pages settings screen.

If the repository is public, the source files are visible to everyone. Do not upload passwords, API keys, private customer data, or payment secrets.
