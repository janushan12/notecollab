const mongoose = require('mongoose');

const CollaboratorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    permissiom: { type: String, enum: ['view', 'edit', 'admin'], default: 'edit' },
});

const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true, default: 'Untitled Note' },
    content: { type: String, default: '' },
    contentText: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [CollaboratorSchema],
    tags: [{ type: String, trim: true, lowercase: true }],
    color: { type: String, default: '#f59e0b' },
    pinned: { type: Boolean, default: false }
},
    { timestamps: true }
);

NoteSchema.index({ title: 'text', contentText: 'text', tags: 'text' });

module.exports = mongoose.model('Note', NoteSchema);