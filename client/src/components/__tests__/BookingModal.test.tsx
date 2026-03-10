import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingModal from "../BookingModal";
import { CabanaInfo } from "../../types";

vi.mock("../../api", () => ({
  bookCabana: vi.fn(),
}));

import { bookCabana } from "../../api";
const mockBookCabana = vi.mocked(bookCabana);

describe("BookingModal", () => {
  const availableCabana: CabanaInfo = {
    id: "cabana-1",
    row: 11,
    col: 3,
    booked: false,
  };

  const bookedCabana: CabanaInfo = {
    id: "cabana-2",
    row: 11,
    col: 4,
    booked: true,
    bookedBy: { room: "101", guestName: "Alice Smith" },
  };

  const onClose = vi.fn();
  const onBooked = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show booking form for available cabana", () => {
    render(
      <BookingModal cabana={availableCabana} onClose={onClose} onBooked={onBooked} />
    );
    expect(screen.getByText("Room Number")).toBeInTheDocument();
    expect(screen.getByText("Guest Name")).toBeInTheDocument();
    expect(screen.getByText("Book")).toBeInTheDocument();
  });

  it("should show unavailable message for booked cabana", () => {
    render(
      <BookingModal cabana={bookedCabana} onClose={onClose} onBooked={onBooked} />
    );
    expect(screen.getByText(/already been booked/i)).toBeInTheDocument();
    expect(screen.queryByText("Book")).not.toBeInTheDocument();
  });

  it("should show error when submitting empty fields", async () => {
    render(
      <BookingModal cabana={availableCabana} onClose={onClose} onBooked={onBooked} />
    );
    fireEvent.click(screen.getByText("Book"));
    expect(screen.getByText(/fill in both fields/i)).toBeInTheDocument();
  });

  it("should call API and show success on valid booking", async () => {
    mockBookCabana.mockResolvedValue({ message: "Booked" });

    render(
      <BookingModal cabana={availableCabana} onClose={onClose} onBooked={onBooked} />
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. 101"), {
      target: { value: "101" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Alice Smith"), {
      target: { value: "Alice Smith" },
    });
    fireEvent.click(screen.getByText("Book"));

    await waitFor(() => {
      expect(mockBookCabana).toHaveBeenCalledWith("cabana-1", "101", "Alice Smith");
    });
    expect(screen.getByText(/successfully/i)).toBeInTheDocument();
  });

  it("should show error message from API on failure", async () => {
    mockBookCabana.mockRejectedValue(new Error("Invalid room number"));

    render(
      <BookingModal cabana={availableCabana} onClose={onClose} onBooked={onBooked} />
    );

    fireEvent.change(screen.getByPlaceholderText("e.g. 101"), {
      target: { value: "999" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. Alice Smith"), {
      target: { value: "Wrong" },
    });
    fireEvent.click(screen.getByText("Book"));

    await waitFor(() => {
      expect(screen.getByText("Invalid room number")).toBeInTheDocument();
    });
  });

  it("should call onClose when Cancel is clicked", () => {
    render(
      <BookingModal cabana={availableCabana} onClose={onClose} onBooked={onBooked} />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});
