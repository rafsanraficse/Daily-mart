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

## Edit products in one place
All catalog items now live in:

- `products-data.js`

This is the only file you need to edit for product content.

### Product fields
Each product uses clear field names:

- `name` (required)
- `price` (required, number only)
- `description` (required)
- `category` (required)
- `image` (required, image URL)
- `unit` (optional)
- `badge` (optional)
- `alt` (optional image text)

### How to add or change a product
1. Open `products-data.js`.
2. Find the `window.DAILYMART_PRODUCTS = [ ... ]` list.
3. To edit a product, update any field values in that product object.
4. To add a product, copy one existing object, paste it inside the list, then change its values.
5. To remove a product, delete that whole object from the list.
6. Save the file and refresh the browser.

If an image link is missing or fails to load, DailyMart will automatically show a built-in fallback image.

## Publish with GitHub Pages
1. Create a repository on GitHub named `dailymart`.
2. Upload `index.html`, `styles.css`, `products-data.js`, `script.js`, and `README.md` to the repository root.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/(root)`, then save.
6. Wait for GitHub Pages to publish and open the URL shown on the Pages settings screen.

If the repository is public, the source files are visible to everyone. Do not upload passwords, API keys, private customer data, or payment secrets.
