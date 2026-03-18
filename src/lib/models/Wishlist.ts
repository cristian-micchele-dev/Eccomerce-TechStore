import mongoose, { Schema, Document, Model } from "mongoose"

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId
  productIds: mongoose.Types.ObjectId[]
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: "User" },
    productIds: { type: [Schema.Types.ObjectId], default: [], ref: "Product" },
  },
  { timestamps: true }
)

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist ?? mongoose.model<IWishlist>("Wishlist", WishlistSchema)

export default Wishlist
