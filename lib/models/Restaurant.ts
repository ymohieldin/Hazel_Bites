import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRestaurant extends Document {
    name: string;
    logoUrl?: string;
    ownerId: string;
    currency?: string;
    instapayUsername?: string;
    taxId?: string;
    commercialReg?: string;
    isActive?: boolean;
    themeColor?: string;
}

const RestaurantSchema = new Schema<IRestaurant>(
    {
        name: { type: String, required: true },
        logoUrl: { type: String },
        ownerId: { type: String, required: true, index: true },
        currency: { type: String, default: "EGP" },
        instapayUsername: { type: String, default: "" },
        taxId: { type: String, default: "" }, // For Egyptian Tax Receipt
        commercialReg: { type: String, default: "" }, // For Egyptian Tax Receipt
        isActive: { type: Boolean, default: true, index: true },
        themeColor: { type: String, default: "#F97316" }, // Default to brand orange
    },
    { timestamps: true }
);

const Restaurant: Model<IRestaurant> =
    mongoose.models.Restaurant || mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);

export default Restaurant;
