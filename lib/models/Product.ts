import mongoose, { Schema, Document, Model } from "mongoose";

interface IProductOption {
    name: string;
    price: number;
}

export interface IProduct extends Document {
    name: string;
    description?: string;
    price: number;
    image?: string;
    categoryId: mongoose.Types.ObjectId;
    isAvailable: boolean;
    options: IProductOption[];
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        image: { type: String },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
        isAvailable: { type: Boolean, default: true },
        options: [
            {
                name: { type: String, required: true },
                price: { type: Number, required: true },
            },
        ],
    },
    { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
