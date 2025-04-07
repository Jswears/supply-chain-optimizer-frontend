"use client"

import type React from "react"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateOrderRequest } from "@/types/order"
import { Product } from "@/types"

interface CreateOrderDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    products: Product[]
    onSubmit: (data: CreateOrderRequest) => Promise<void>
    warehouseId?: string
}

export function CreateOrderDialog({ open, onOpenChange, products, onSubmit, warehouseId = "warehouse_main_01" }: CreateOrderDialogProps) {
    const [productId, setProductId] = useState("")
    const [quantity, setQuantity] = useState("1")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!productId || !quantity) return

        setIsSubmitting(true)
        try {
            await onSubmit({
                product_id: productId,
                warehouse_id: warehouseId,
                quantity: Number.parseInt(quantity),
            })
            resetForm()
            onOpenChange(false)
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setProductId("")
        setQuantity("1")
    }

    // Filter products that are below reorder threshold
    const lowStockProducts = products.filter((product) => product.stock_level < product.reorder_threshold)

    const getSupplierForProduct = (productId: string) => {
        const product = products.find((p) => p.product_id === productId)
        return product ? product.supplier : "Unknown"
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                resetForm() // Reset form when dialog is closed
            }
            onOpenChange(isOpen)
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Purchase Order</DialogTitle>
                    <DialogDescription>Place a new order to restock inventory from suppliers.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="product">Product to Order</Label>
                            <Select value={productId} onValueChange={setProductId} required>
                                <SelectTrigger id="product">
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lowStockProducts.length > 0 ? (
                                        <>
                                            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Low Stock Items</div>
                                            {lowStockProducts.map((product) => (
                                                <SelectItem key={product.product_id} value={product.product_id}>
                                                    {product.product_name} ({product.stock_level}/{product.reorder_threshold})
                                                </SelectItem>
                                            ))}
                                            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Other Products</div>
                                        </>
                                    ) : null}
                                    {products
                                        .filter((product) => product.stock_level >= product.reorder_threshold)
                                        .map((product) => (
                                            <SelectItem key={product.product_id} value={product.product_id}>
                                                {product.product_name} ({product.stock_level} in stock)
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {productId && (
                            <div className="text-sm text-muted-foreground">Supplier: {getSupplierForProduct(productId)}</div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Order Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !productId || !quantity}>
                            {isSubmitting ? "Creating..." : "Place Order"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}