import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
    name: string;
    order: number;
    restaurantId: mongoose.Types.ObjectId;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true },
        order: { type: Number, default: 0 },
        restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    },
    { timestamps: true }
);

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
