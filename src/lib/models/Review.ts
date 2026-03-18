import mongoose, { Schema } from "mongoose"

const ReviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
})

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

export default mongoose.models.Review ?? mongoose.model("Review", ReviewSchema)
