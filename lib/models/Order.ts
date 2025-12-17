import mongoose, { Schema, Document, Model } from "mongoose";

// We can elaborate on items structure if needed, keeping it flexible for now
interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    options?: { name: string; price: number }[];
    instruction?: string;
}

export interface IOrder extends Document {
    tableId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: "pending" | "preparing" | "ready" | "served" | "paid" | "payment_verification";
    paymentMethod: "cash" | "card" | "instapay" | "online";
    orderNumber?: number;
}

const OrderSchema = new Schema<IOrder>(
    {
        tableId: { type: Schema.Types.ObjectId, ref: "Table", required: true, index: true },
        orderNumber: { type: Number },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: "Product" },
                name: String,
                quantity: Number,
                price: Number,
                options: [{ name: String, price: Number }],
                instruction: String,
            },
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "preparing", "ready", "served", "paid", "payment_verification"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "card", "instapay", "online"],
            default: "cash",
        },
    },
    { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
