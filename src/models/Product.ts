import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  farmer: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  pricePerUnit: number;
  unit: string;
  imageUrl: string;
  localStock: number;
  industrialStock: number;
  totalStock: number;
  isActive: boolean;
  harvestDate?: Date;
  expiryDate?: Date;
  isOrganic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Farmer reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "vegetables", "fruits", "grains", "pulses", "spices",
        "dairy", "oilseeds", "flowers", "herbs", "nuts", "other",
      ],
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: ["kg", "quintal", "ton", "dozen", "piece", "liter", "bundle"],
    },
    imageUrl: { type: String, default: "" },
    localStock: {
      type: Number,
      required: true,
      min: [0, "Local stock cannot be negative"],
      default: 0,
    },
    industrialStock: {
      type: Number,
      required: true,
      min: [0, "Industrial stock cannot be negative"],
      default: 0,
    },
    isActive: { type: Boolean, default: true },
    harvestDate: { type: Date },
    expiryDate: { type: Date },
    isOrganic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("totalStock").get(function () {
  return this.localStock + this.industrialStock;
});

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ farmer: 1, isActive: 1 });

const ProductModel =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
export default ProductModel;
