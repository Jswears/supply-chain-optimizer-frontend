'use client';

import { Search, X, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useProductsStore } from "@/stores/productsStore";
import { ProductTable } from "./product-table";
import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { Button } from "../ui/button";

const ProductsView = () => {
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const {
        fetchProducts,
        products,
        error,
    } = useProductsStore();
    const isLoading = products.length === 0 && !error;

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    useEffect(() => {
        if (products.length === 0) {
            fetchProducts();
        }
    }, [fetchProducts, products.length]);

    useEffect(() => {
        if (products.length > 0) {
            if (searchQuery.trim() === "") {
                setFilteredProducts(products);
            } else {
                const lowercaseQuery = searchQuery.toLowerCase();
                const filtered = products.filter((product) =>
                    product.product_name.toLowerCase().includes(lowercaseQuery) ||
                    product.category.toLowerCase().includes(lowercaseQuery) ||
                    product.supplier.toLowerCase().includes(lowercaseQuery)
                );
                setFilteredProducts(filtered);
            }
        }
    }, [products, searchQuery]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col justify-center items-center h-64 text-red-500 gap-2">
                    <AlertTriangle className="h-8 w-8" />
                    <p>Error loading products. Please try again later.</p>
                    <Button variant="outline" className="mt-2" onClick={() => fetchProducts()}>
                        Retry
                    </Button>
                </div>
            );
        }

        if (filteredProducts.length === 0) {
            return (
                <div className="flex flex-col justify-center items-center h-64 text-muted-foreground">
                    <p>No products found{searchQuery ? " matching your search" : ""}.</p>
                    {searchQuery && (
                        <Button variant="outline" className="mt-4 cursor-pointer" onClick={handleClearSearch}>
                            Clear Search
                        </Button>
                    )}
                </div>
            );
        }

        return isDesktop ? (
            <ProductTable products={filteredProducts} />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Bakery Inventory</h1>
                <Button
                    variant="outline"
                    onClick={() => fetchProducts()}
                    disabled={isLoading}
                    className="text-sm cursor-pointer"
                >
                    {isLoading ? "Refreshing..." : "Refresh Data"}
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, category or supplier..."
                            className="pl-10 pr-10 transition-all focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                onClick={handleClearSearch}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Clear search</span>
                            </Button>
                        )}
                    </div>

                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductsView;
