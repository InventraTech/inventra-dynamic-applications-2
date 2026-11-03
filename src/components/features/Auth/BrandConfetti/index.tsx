interface ConfettiPiece {
    id: string;
    className: string;
}

const confettiPieces: ConfettiPiece[] = [
    { id: "one", className: "left-login-confetti-one-left top-login-confetti-one-top size-login-confetti-size bg-login-gold" },
    { id: "two", className: "left-login-confetti-two-left top-login-confetti-two-top size-login-confetti-small bg-login-confetti-white" },
    { id: "three", className: "left-login-confetti-three-left top-login-confetti-three-top size-login-confetti-small bg-login-confetti-white" },
    { id: "four", className: "left-login-confetti-four-left top-login-confetti-four-top size-login-confetti-small bg-login-confetti-white" },
    { id: "five", className: "left-login-confetti-five-left top-login-confetti-five-top size-login-confetti-small bg-login-confetti-soft" },
    { id: "six", className: "left-login-confetti-six-left top-login-confetti-six-top size-login-confetti-small bg-login-confetti-gold" },
    { id: "seven", className: "left-login-confetti-seven-left top-login-confetti-seven-top size-login-confetti-size bg-login-gold" },
    { id: "eight", className: "left-login-confetti-eight-left top-login-confetti-eight-top size-login-confetti-small bg-login-gold" },
    { id: "nine", className: "left-login-confetti-nine-left top-login-confetti-nine-top size-login-confetti-size bg-login-gold" },
];

function BrandConfetti() {
    return (
        <div className="pointer-events-none absolute inset-0 max-lg:hidden" aria-hidden="true">
            {confettiPieces.map((piece) => (
                <span
                    className={`absolute rotate-45 rounded-sm ${piece.className}`}
                    key={piece.id}
                />
            ))}
        </div>
    );
}

export default BrandConfetti;
