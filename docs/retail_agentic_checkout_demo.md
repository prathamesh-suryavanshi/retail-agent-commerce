# Retail gift and delivery demo

## Story

One shopper asks ChatGPT for a gift for her dad, who uses an iPhone and enjoys walking. ChatGPT compares one suitable smartwatch and one suitable pair of headphones under ₹6,000. She chooses the black smartwatch. Before checkout, the last black unit sells. ChatGPT checks stock again, offers the available blue version, gets her approval, and completes one online demo order.

The Pulse 2 and TrailTone listings promise delivery by Friday for demo postcode `560001`. The availability tool returns the exact upcoming Friday date, calculated in `Asia/Kolkata`; ChatGPT should use that date for its delivery estimate.

## Before the demo

1. Run `npm run dev` and open `http://localhost:5173/?reset` in the same supported browser that will provide WebMCP to ChatGPT.
2. Make sure the store shows its WebMCP tools as live. WebMCP keeps ChatGPT's tool actions and the visible store on the same browser data.
3. The reset URL seeds one black strap and six blue straps for the Pulse 2. The fictional TrailTone headphones are in stock at ₹4,499. After the stock simulation, don't reload `?reset` until the walkthrough is over.
4. Keep the store and ChatGPT side by side. Use the fictional checkout details below; no payment or email is sent.

## One continuous shopper journey

Introduce the scenario:

> “Let’s follow one shopper from gift discovery through checkout. She’ll compare two relevant options, choose the watch, and then we’ll simulate a stock change before she confirms.”

Enter:

```text
My dad's birthday is on Saturday. He uses an iPhone and enjoys walking. Find gifts under ₹6,000 that can arrive by Friday. Open http://localhost:5173/?reset
```

The demo's `recommend_two_gift_options` WebMCP tool is designed for this exact broad request. It returns the Pulse 2 and TrailTone together with current variant stock and the next-Friday estimate for configured demo postcode `560001`, and displays both in the storefront so the shopper can open either product. This requires the tool to run through WebMCP in the open storefront tab; the separate MCP server cannot control that tab. Each listing also includes the paired alternative in its catalog result, so ChatGPT has both choices even if it starts with only one category.

Have the shopper choose the black watch and pause before checkout:

```text
I like the Pulse 2. Add the black strap to my cart, but don't check out yet.
```

After ChatGPT confirms that the black strap is in the cart, click **Simulate last black watch sold** on the visible store website. This changes black stock from one to zero in the same browser store WebMCP reads.

Return to ChatGPT and prompt it to recheck before checkout:

```text
I'm ready to check out.
```

ChatGPT should find black out of stock, check the blue strap, report its actual stock and ETA, and ask before changing the cart. Approve the substitution:

```text
Yes
```

Provide fictional checkout details for ChatGPT to prepare the order review:

```text
Usha, usha@example.test, +91 9000000000, 1 Demo Lane, Thiruvananthapuram, postcode 560001. Place the order.
```

Show the single order confirmation on the storefront. Black should be out of stock and blue stock reduced by one.

## Close

> “The shopper chose a gift from two relevant options. Before checkout, stock changed. ChatGPT rechecked the catalog, offered an available colour with a verified delivery estimate, asked before updating the cart, and completed the order.”

The demo uses a fictional catalog, browser storage, and a simulated stock event. Its delivery estimate and order state demonstrate the integration flow; they are not connected to a retailer's live inventory, carrier, payment, or email systems.

## Reset

Click **Reset demo data** in the footer. It restores the seeded catalog, black stock of one, blue stock of six, and clears the cart and orders. The same reset can also be triggered by opening the store with `?reset`.
