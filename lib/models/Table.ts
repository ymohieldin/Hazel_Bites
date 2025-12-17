import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITable extends Document {
    number: number;
    qrCodeUrl?: string;
    restaurantId: string;
    status: "free" | "occupied";
}

const TableSchema = new Schema<ITable>(
    {
        number: { type: Number, required: true },
        qrCodeUrl: { type: String },
        restaurantId: { type: String, required: true, index: true },
        status: { type: String, enum: ["free", "occupied"], default: "free" },
    },
    { timestamps: true }
);

// Compound index to ensure table numbers are unique per restaurant
TableSchema.index({ restaurantId: 1, number: 1 }, { unique: true });

const Table: Model<ITable> = mongoose.models.Table || mongoose.model<ITable>("Table", TableSchema);

export default Table;
