import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Product } from "../../types";

const cartItemStoragePrefix = "gtin_";

const CartPage = () => {
  let amountFormatter = new Intl.NumberFormat();
  if (typeof navigator !== "undefined") {
    amountFormatter = new Intl.NumberFormat(navigator.language, {
      style: "currency",
      currency: "EUR",
    });
  }
  const [itemIds, setItemIds] = useState(() => {
    if (typeof window === "undefined") return [];

    const keys = Array.from(Array(localStorage.length), (_, i) =>
      localStorage.key(i)
    )
      .filter((key) => key?.startsWith(cartItemStoragePrefix))
      .filter(Boolean);
    return keys.map((key) => ({
      gtin: key?.replace(cartItemStoragePrefix, ""),
      quantity: JSON.parse(localStorage.getItem(key ?? "") || "{}").quantity,
    }));
  });
  const [items, setItems] = useState<Array<Product & { quantity: number }>>([]);
  useEffect(() => {
    Promise.all(
      itemIds.map(({ gtin, quantity }) => {
        const url = new URL(`api/products/${gtin}`, "http://localhost:3000");
        return fetch(url.href)
          .then((response) => (response.ok ? response.json() : response.text()))
          .then((data) => {
            if (typeof data === "string") throw new Error(data);
            return {
              ...data,
              quantity,
            };
          });
      })
    ).then(setItems);
  }, [itemIds]);

  return (
    <Layout>
      <main className="grid grid-cols-8 grid-rows-[auto_1fr]">
        <h1 className="col-span-full text-xl">Your Cart</h1>
        <ul className="col-span-6">
          {items.map(
            ({ gtin, name, quantity, imageUrl, recommendedRetailPrice }) => (
              <li key={gtin} className="flex items-center my-4">
                <span className="mr-4">
                  <button
                    className="px-4 py-1 bg-purple-400"
                    onClick={() => updateQuantity(gtin, quantity - 1)}
                  >
                    <span aria-hidden="true">-</span>
                    <span className="sr-only">Decrease quantity by one</span>
                  </button>
                  <span className="mx-4 text-lg">{quantity}</span>
                  <button
                    className="px-4 py-1 bg-purple-400"
                    onClick={() => updateQuantity(gtin, quantity + 1)}
                  >
                    <span aria-hidden="true">+</span>
                    <span className="sr-only">Increase quantity by one</span>
                  </button>
                </span>
                <img src={imageUrl} alt="" className="w-24 h-24" />
                <div className="ml-2">
                  <p className="font-semibold">{name}</p>
                  <span className="text-gray-300 font-medium">
                    {amountFormatter.format(recommendedRetailPrice)} ea.
                  </span>
                </div>
                <button
                  className="ml-auto bg-red-600 px-4 py-1"
                  onClick={() => removeFromCart(gtin)}
                >
                  <span className="sr-only">Remove from cart</span>
                  <span aria-hidden="true">🗑</span>
                </button>
              </li>
            )
          )}
        </ul>
        <h2 className="col-span-2 text-2xl">
          Total -{" "}
          {amountFormatter.format(
            items.reduce(
              (acc, { recommendedRetailPrice, quantity }) =>
                acc + recommendedRetailPrice * quantity,
              0
            )
          )}
        </h2>
      </main>
    </Layout>
  );

  function removeFromCart(gtin: string) {
    localStorage.removeItem(`${cartItemStoragePrefix}${gtin}`);
    setItemIds((ids) => ids.filter(({ gtin: id }) => id !== gtin));
  }

  function updateQuantity(gtin: string, quantity: number) {
    if (quantity > 0) {
      localStorage.setItem(
        `${cartItemStoragePrefix}${gtin}`,
        JSON.stringify({ quantity })
      );
      setItems((items) =>
        items.map((item) => {
          if (item.gtin === gtin) {
            item.quantity = quantity;
          }
          return item;
        })
      );
    } else {
      removeFromCart(gtin);
    }
  }
};

export default CartPage;
