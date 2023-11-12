import mongoose from "mongoose";

const screamSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId: { type: String },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scream",
        }
    ],
});

const Scream = mongoose.models.Scream || mongoose.model("Scream", screamSchema);

export default Scream;
