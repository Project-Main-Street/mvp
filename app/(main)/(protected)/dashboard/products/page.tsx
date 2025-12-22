import ProductsList from "@/lib/components/ProductsList";
import { getAllProducts } from "@/lib/db";
import { Heading, Box } from "@radix-ui/themes";
import { stackServerApp } from "@/stack/server";

export default async function ProductsPage() {
    const user = await stackServerApp.getUser({ or: "redirect" });
    const allProducts = await getAllProducts();

    return (
        <Box>
            <Heading as="h2" size="6" mb="4">
                Products Directory
            </Heading>
            <ProductsList products={allProducts} />
        </Box>
    );
}
