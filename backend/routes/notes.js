const express= require("express");
const { protect } = require("../middleware/auth");
const router = express.Router();
const Note = require('../models/Note')
const User = require('../models/User')

router.use(protect);

const canAccess = (note, userId, level = 'view') => {
    if (note.owner.toString() === userId.toString()) return true;
    const c= note.collaborators.find(c=> c.user.toString() === userId.toString())

    if (!c) return false;
    if (level === 'view') return true;
    if (level === 'edit') return ['edit', 'view'].includes(c.permission);
    if (level === 'admin') return c.permission === 'admin';
    return false;
};

router.get('/', async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = {
      $or: [{ owner: req.user._id }, { 'collaborators.user': req.user._id }],
    };
    if (search) query.$text = { $search: search };
    if (tag) query.tags = tag.toLowerCase();

    const notes = await Note.find(query)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email')
      .sort({ pinned: -1, updatedAt: -1 });

    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, owner: req.user._id });
    await note.populate('owner', 'name email');
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');
    if (!note) return res.status(404).json({ message: 'Not found' });
    if (!canAccess(note, req.user._id)) return res.status(403).json({ message: 'Access denied' });
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    if (!canAccess(note, req.user._id, 'edit')) return res.status(403).json({ message: 'Edit permission required' });

    const { title, content, contentText, tags, color, pinned } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (contentText !== undefined) note.contentText = contentText;
    if (tags !== undefined) note.tags = tags;
    if (color !== undefined) note.color = color;
    if (pinned !== undefined) note.pinned = pinned;

    await note.save();
    await note.populate('owner', 'name email');
    await note.populate('collaborators.user', 'name email');
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    if (note.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Owner only' });
    await note.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/collaborators', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Owner only' });

    const invitedUser = await User.findOne({ email: req.body.email });
    if (!invitedUser) return res.status(404).json({ message: 'User not found' });
    if (invitedUser._id.toString() === note.owner.toString())
      return res.status(400).json({ message: 'Cannot add owner as collaborator' });

    const already = note.collaborators.find(c => c.user.toString() === invitedUser._id.toString());
    if (already) return res.status(400).json({ message: 'Already a collaborator' });

    note.collaborators.push({ user: invitedUser._id, permission: req.body.permission || 'edit' });
    await note.save();
    await note.populate('owner', 'name email');
    await note.populate('collaborators.user', 'name email');
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/collaborators/:userId', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    if (note.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Owner only' });

    const c = note.collaborators.find(c => c.user.toString() === req.params.userId);
    if (!c) return res.status(404).json({ message: 'Collaborator not found' });
    c.permission = req.body.permission;
    await note.save();
    await note.populate('collaborators.user', 'name email');
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id/collaborators/:userId', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    const isOwner = note.owner.toString() === req.user._id.toString();
    const isSelf = req.params.userId === req.user._id.toString();
    if (!isOwner && !isSelf) return res.status(403).json({ message: 'Not authorized' });

    note.collaborators = note.collaborators.filter(c => c.user.toString() !== req.params.userId);
    await note.save();
    await note.populate('collaborators.user', 'name email');
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;