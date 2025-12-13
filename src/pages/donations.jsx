
import "../styles/CSS/donations.css";

function Donations() {
  
  const STRIPE_DONATION_LINK = "https://buy.stripe.com/test_9B600ifSu2r32hr33X3Ru00";

  return (
    <div className="donations-container">
      <h1>Support Our Mission</h1>
      <p>Your donation helps us reunite lost items with their owners.</p>

      {/* Stripe Donate Button */}
      <a
        href={STRIPE_DONATION_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="donate-btn"
      >
        Donate with Card 
      </a>

      {/* Revolut section */}
      <h2 style={{ marginTop: "40px", marginBottom: "20px" }}>
        Donate via Revolut 💸
      </h2>

      <div className="donation-options">
        {/* QR */}
        <div className="qr-section">
          <img
            src="/Pictures/revolut.qr.jpeg"
            alt="Revolut QR"
            className="qr-img"
          />
        </div>

        {/* OR */}
        <div className="or-text">OR</div>

        {/* Button link */}
        <div className="btn-section">
          <a
            href="https://revolut.me/madali1nvm"
            target="_blank"
            rel="noopener noreferrer"
            className="revolut-btn"
          >
            Open Revolut 🔗
          </a>
        </div>
      </div>
    </div>
  );
}

export default Donations;
