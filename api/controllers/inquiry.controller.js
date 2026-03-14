import Inquiry from "../models/inquiry.model.js";
import { errorHandler } from "../utils/error.js";

export const sendInquiry = async (req, res, next) => {
  try {
    const { listingId, recipientId, message } = req.body;
    const inquiry = await Inquiry.create({
      listing: listingId,
      sender: req.user.id,
      recipient: recipientId,
      message,
    });
    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
};

export const getMyInquiries = async (req, res, next) => {
  try {
    const received = await Inquiry.find({ recipient: req.user.id })
      .populate("sender", "username avatar email")
      .populate("listing", "name imageUrls address")
      .sort({ createdAt: -1 });
    const sent = await Inquiry.find({ sender: req.user.id })
      .populate("recipient", "username avatar email")
      .populate("listing", "name imageUrls address")
      .sort({ createdAt: -1 });
    res.status(200).json({ received, sent });
  } catch (error) {
    next(error);
  }
};

export const markInquiryRead = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return next(errorHandler(404, "Inquiry not found"));
    if (inquiry.recipient.toString() !== req.user.id)
      return next(errorHandler(403, "Not authorized"));
    inquiry.read = true;
    await inquiry.save();
    res.status(200).json(inquiry);
  } catch (error) {
    next(error);
  }
};
