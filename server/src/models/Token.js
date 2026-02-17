import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    validationTime: { type: Date, required: true }
})

const Token = mongoose.model('Token', tokenSchema);

export default Token