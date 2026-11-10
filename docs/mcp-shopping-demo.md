# ShopWave MCP demo: the store comes to your assistant

## Story

After buying a gift for her dad in the WebMCP demo, the shopper wants to consider headphones as a gift for someone else. This time, she shops from her assistant without opening the ShopWave website. She explores a product, saves it for later, checks her wishlist, and then changes her mind.

## Before the demo

1. Start the MCP server and ngrok using [the startup instructions](mcp-ngrok.md).
2. Connect ShopWave to your assistant using the ngrok `/mcp` URL, and make sure the connector is enabled.
3. Close the ShopWave website tab. Keep the assistant visible to the audience.
4. Check the MCP server's wishlist before presenting and remove any leftover items if needed.

The MCP server has its own demo data, separate from the WebMCP storefront's browser storage. The order from the earlier demo will not automatically appear here. Interactive product views depend on the assistant's MCP Apps support.

## Transition from WebMCP

> “We’ve just seen the assistant work with ShopWave while the website was open. But what happens when the shopper isn’t on the website?
>
> What if she could bring the store into her assistant, ask a question, see products, and manage her shopping—all inside the conversation?
>
> Let’s close the ShopWave tab and try it.”

## 1. Bring the store into the conversation

> “The watch is sorted. Now I’m thinking headphones might make a good gift for someone else.”

Prompt:

```text
Using ShopWave, show me headphones and their available variants.
```

Choose an available pair from the results and ask to see its details if needed. Show the product information, variants, and interactive product view if supported.

> “I didn’t navigate to a store or search a webpage. The store’s product experience came to me inside the assistant.”

## 2. Save a pair for later

Prompt:

```text
I’m not ready to buy yet. Save an available variant of those headphones to my wishlist.
```

Then ask:

```text
What’s on my ShopWave wishlist? Is it currently available?
```

Show the saved item and its current stock. This demonstrates `add_to_wishlist` and `get_wishlist`.

> “The assistant isn’t just answering a question. It can help me pick up this shopping journey later.”

## 3. Change your mind

Prompt:

```text
Actually, remove the headphones from my wishlist. I’ll come back to them another time.
```

Show the result, and ask to see the wishlist again if useful. This demonstrates `remove_from_wishlist`.

> “The conversation can manage the shopping state too. I can make a decision and change it without switching apps.”

## Optional extensions

- **Cart editing:** Add an available product, then ask to change its quantity or remove it. Show the cart and recalculated totals. Verify that `set_cart_quantity` is available before demonstrating quantity changes.
- **Order history:** Ask “What demo orders have I placed?” Place an order through the MCP connector first if you want a populated result.
- **Checkout:** Show the checkout form if `show_checkout` is available in your connected server. The earlier WebMCP story already covers checkout and order placement.

## Close

> “With WebMCP, the assistant could work with the website I had open. Here, the same kind of shopping capability is available directly in the assistant. The conversation becomes the place where I discover, decide, and take action.”
