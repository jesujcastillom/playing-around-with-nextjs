import { useState } from "react";
import Layout from "../components/Layout";
import { ProductsResponse } from "../types";

function getProducts(page: number = 1) {
  const url = new URL("api/products", "http://localhost:3000");
  url.searchParams.set("page", String(page));
  return fetch(url.href)
    .then(async (response) => {
      return response.ok ? response.json() : response.text();
    })
    .then((result) => {
      if (typeof result != "string") return result;
      throw new Error(result);
    });
}

export async function getServerSideProps() {
  try {
    const props = await getProducts();
    return { props };
  } catch (e) {
    return { props: null };
  }
}

const HomePage = ({ results, page }: ProductsResponse) => {
  const [products, setProducts] = useState(results);
  const [currentPage, setCurrentPage] = useState(page);
  return (
    <Layout>
      <h1>Products</h1>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {products.map(({ name, gtin, imageUrl, brandName }) => (
          <li
            key={gtin}
            className="shadow-lg shadow-zinc-400 px-4 py-2 grid grid-rows-product-item grid-cols-4"
          >
            <img src={imageUrl} alt="" className="w-full col-span-full" />
            <p className="font-semibold text-slate-700 col-span-full">{name}</p>
            <p className="text-slate-300/20 col-span-full">{brandName}</p>
            <button
              className="bg-purple-500 hover:bg-purple-600 col-end-5 col-span-2 py-2 text-white mt-3 rounded-md"
              onClick={() => addToCart(gtin)}
            >
              Add{" "}
              <span className="sr-only">
                {name} by {brandName}
              </span>{" "}
              to cart
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={loadNextPage}
        className="my-8 bg-gray-200 hover:bg-gray-300 self-center py-2 px-6 rounded-md"
      >
        Show more
      </button>
    </Layout>
  );
  async function loadNextPage() {
    try {
      const { results: nextPageProducts } = await getProducts(currentPage + 1);
      setCurrentPage((p) => p + 1);
      setProducts(products.concat(nextPageProducts));
    } catch {}
  }

  function addToCart(gtin: string) {
    const storageKey = `gtin_${gtin}`;
    const { quantity: addedToCart = 0 } = JSON.parse(
      localStorage.getItem(storageKey) || "{}"
    );
    const quantity = addedToCart + 1;
    localStorage.setItem(storageKey, JSON.stringify({ quantity }));
  }
};

export default HomePage;
