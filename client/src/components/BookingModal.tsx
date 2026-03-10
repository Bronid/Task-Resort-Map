import React, { useState } from "react";
import { CabanaInfo } from "../types";
import { bookCabana } from "../api";

interface Props {
  cabana: CabanaInfo;
  onClose: () => void;
  onBooked: () => void;
}

const BookingModal: React.FC<Props> = ({ cabana, onClose, onBooked }) => {
  const [room, setRoom] = useState("");
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    setError("");
    if (!room.trim() || !guestName.trim()) {
      setError("Please fill in both fields");
      return;
    }

    setLoading(true);
    try {
      await bookCabana(cabana.id, room.trim(), guestName.trim());
      setSuccess(true);
      setTimeout(() => {
        onBooked();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{cabana.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</h2>

        {cabana.booked ? (
          <>
            <p className="unavailable-msg">
              This cabana is currently unavailable - it has already been booked.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : success ? (
          <p className="success-msg">
            Booked successfully! Redirecting to map...
          </p>
        ) : (
          <>
            <label>
              Room Number
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. 101"
                autoFocus
              />
            </label>
            <label>
              Guest Name
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Alice Smith"
              />
            </label>
            {error && <p className="error-msg">{error}</p>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-book"
                onClick={handleBook}
                disabled={loading}
              >
                {loading ? "Booking..." : "Book"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
