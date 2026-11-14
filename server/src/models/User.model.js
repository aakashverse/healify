import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        passwordHash: {
            type: String,
            required: [true, "Password hash is required"]
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        age: {
            type: Number,
            min: 0,
            max: 130,
            default: null
        },
        gender: {
            type: String,
            trim: true,
            default: ""
        },
        bloodGroup: {
            type: String,
            trim: true,
            uppercase: true,
            default: ""
        },
        allergies: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                ret.id = ret._id ? ret._id.toString() : ret.id;
                ret.blood_group = ret.bloodGroup;
                delete ret._id;
                delete ret.__v;
                delete ret.passwordHash;
                delete ret.password_hash;
                return ret;
            }
        },
        toObject: {
            virtuals: true,
            transform(doc, ret) {
                ret.id = ret._id ? ret._id.toString() : ret.id;
                ret.blood_group = ret.bloodGroup;
                delete ret._id;
                delete ret.__v;
                delete ret.passwordHash;
                delete ret.password_hash;
                return ret;
            }
        }
    }
);

// Virtual for password_hash backward-compatibility
UserSchema.virtual("password_hash")
    .get(function () {
        return this.passwordHash;
    })
    .set(function (v) {
        this.passwordHash = v;
    });

// Virtual for blood_group backward-compatibility
UserSchema.virtual("blood_group")
    .get(function () {
        return this.bloodGroup;
    })
    .set(function (v) {
        this.bloodGroup = v;
    });

// Pre-validate hook to map virtuals if passed in constructor
UserSchema.pre("validate", function () {
    if (!this.passwordHash && this.password_hash) {
        this.passwordHash = this.password_hash;
    }
    if (!this.bloodGroup && this.blood_group) {
        this.bloodGroup = this.blood_group;
    }
});

// Instance method to compare password with bcrypt
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!candidatePassword || !this.passwordHash) return false;
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static method to find user by email
UserSchema.statics.findByEmail = async function (email) {
    if (!email) return null;
    return this.findOne({ email: email.toLowerCase().trim() });
};

// Static method to update user profile
UserSchema.statics.updateProfile = async function (id, updates = {}) {
    const allowed = {};
    if (updates.name !== undefined) allowed.name = updates.name.trim();
    if (updates.phone !== undefined) allowed.phone = updates.phone.trim();
    if (updates.age !== undefined) allowed.age = updates.age ? Number(updates.age) : null;
    if (updates.gender !== undefined) allowed.gender = updates.gender.trim();
    if (updates.blood_group !== undefined) allowed.bloodGroup = updates.blood_group.trim().toUpperCase();
    if (updates.bloodGroup !== undefined) allowed.bloodGroup = updates.bloodGroup.trim().toUpperCase();
    if (updates.allergies !== undefined) allowed.allergies = updates.allergies.trim();

    return this.findByIdAndUpdate(id, allowed, { new: true, runValidators: true });
};

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
