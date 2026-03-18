import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name?: string
  email: string
  emailVerified?: Date
  image?: string
  password?: string
  phone?: string
  role: "CUSTOMER" | "ADMIN"
  provider?: string
  providerAccountId?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date },
    image: { type: String },
    password: { type: String },
    phone: { type: String },
    role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER" },
    provider: { type: String },
    providerAccountId: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString()
        delete ret._id
        delete ret.__v
        delete ret.password
        return ret
      },
    },
  }
)

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema)

export default User
