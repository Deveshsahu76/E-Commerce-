export const staticPages = {
  about: {
    eyebrow: "About SonicRaksha",
    title: "A trusted shopping experience built for everyday customers.",
    intro:
      "SonicRaksha helps customers discover quality products, exciting offers, and a smooth ordering experience with secure checkout and reliable support.",
    sections: [
      {
        title: "Our Promise",
        description:
          "We focus on simple browsing, transparent pricing, and a checkout experience that customers can trust.",
        points: ["Quality products", "Clear pricing", "Smooth checkout", "Customer-first support"],
      },
      {
        title: "Why Customers Choose Us",
        description:
          "The store is designed to be fast, responsive, and easy to use across mobile, tablet, and desktop.",
        points: ["Fast ordering", "Easy returns support", "Secure payments", "Helpful order updates"],
      },
    ],
    cta: {
      title: "Have a question before ordering?",
      text: "Reach out to our support team and we will help you choose the right product.",
      label: "Contact Us",
      to: "/contact",
    },
  },

  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions.",
    intro: "Find quick answers about orders, payments, delivery, returns, and account support.",
    sections: [
      {
        title: "How do I place an order?",
        description:
          "Open a product, add it to your cart, fill your delivery details, choose a payment method, and confirm your order.",
      },
      {
        title: "Which payment methods are supported?",
        description:
          "You can pay online using UPI, cards, net banking, wallets, or choose Cash on Delivery when available.",
      },
      {
        title: "Can I cancel my order?",
        description:
          "Orders can be cancelled before they are shipped. Visit your order details page to check cancellation availability.",
      },
      {
        title: "How can I contact support?",
        description:
          "Use the Contact or Support page to send your query. Keep your order ID ready for faster help.",
      },
    ],
    cta: {
      title: "Still need help?",
      text: "Our support page has quick links for payment, delivery, returns, and order help.",
      label: "Visit Support",
      to: "/support",
    },
  },

  shipping: {
    eyebrow: "Shipping Policy",
    title: "Clear and simple delivery information.",
    intro:
      "We aim to process confirmed orders quickly and keep customers informed throughout the delivery journey.",
    sections: [
      {
        title: "Delivery Timeline",
        points: [
          "Estimated delivery timelines may vary by location and product availability.",
          "Customers can check order status from the My Orders section.",
          "Unexpected delays may occur during holidays, weather disruptions, or courier issues.",
        ],
      },
      {
        title: "Shipping Charges",
        points: [
          "Shipping charges, if applicable, are shown during checkout before placing the order.",
          "Free delivery offers may be available on selected orders.",
        ],
      },
    ],
    cta: {
      title: "Need delivery support?",
      text: "Contact us with your order ID and registered phone/email.",
      label: "Contact Support",
      to: "/support",
    },
  },

  returns: {
    eyebrow: "Return & Refund Policy",
    title: "Easy support for return and refund requests.",
    intro:
      "Return and refund eligibility depends on product condition, delivery status, and store policy.",
    sections: [
      {
        title: "Return Window",
        points: [
          "Return requests should be raised within the eligible return period.",
          "Products must be unused and returned with original packaging where applicable.",
          "Some products may be non-returnable due to hygiene, usage, or seller policy.",
        ],
      },
      {
        title: "Refund Process",
        points: [
          "Refunds are processed after product verification.",
          "Online payment refunds are usually processed to the original payment method.",
          "Refund timelines may vary depending on bank/payment provider processing time.",
        ],
      },
    ],
    cta: {
      title: "Want to raise a return request?",
      text: "Use the support page and share your order ID with details.",
      label: "Get Help",
      to: "/support",
    },
  },

  privacy: {
    eyebrow: "Privacy Policy",
    title: "Your privacy matters to us.",
    intro:
      "We collect only the information required to process orders, support customers, and improve the shopping experience.",
    sections: [
      {
        title: "Information We Use",
        points: [
          "Name, email, phone number, and delivery address for order processing.",
          "Order and payment status for support and fulfilment.",
          "Website usage information to improve browsing and performance.",
        ],
      },
      {
        title: "Payment Security",
        points: [
          "Sensitive payment details are handled by secure payment providers.",
          "We do not store card details or payment passwords on the website.",
        ],
      },
    ],
    cta: {
      title: "Have a privacy question?",
      text: "Contact support for any privacy or account-related query.",
      label: "Contact Us",
      to: "/contact",
    },
  },

  terms: {
    eyebrow: "Terms & Conditions",
    title: "Website usage and ordering terms.",
    intro:
      "By using this website, customers agree to follow basic store policies related to orders, payments, pricing, and product availability.",
    sections: [
      {
        title: "Product Availability",
        points: [
          "Products are subject to stock availability.",
          "Prices and offers may change without prior notice.",
          "Product images are for representation and may slightly vary from actual products.",
        ],
      },
      {
        title: "Orders & Payments",
        points: [
          "Orders are confirmed after successful checkout or accepted Cash on Delivery request.",
          "Online payments are processed through secure payment providers.",
          "The store may cancel suspicious or invalid orders.",
        ],
      },
    ],
    cta: {
      title: "Need clarification?",
      text: "Contact our team before placing an order if you need more information.",
      label: "Contact Support",
      to: "/support",
    },
  },

  cancellation: {
    eyebrow: "Cancellation Policy",
    title: "Simple cancellation guidance.",
    intro:
      "Customers can request cancellation before an order is shipped or processed for delivery.",
    sections: [
      {
        title: "When Cancellation Is Allowed",
        points: [
          "Cancellation is usually allowed before shipment.",
          "Once shipped or delivered, return/refund policy may apply instead.",
          "Custom or special-order products may not be cancellable.",
        ],
      },
      {
        title: "Refund After Cancellation",
        points: [
          "For prepaid orders, eligible refunds are processed to the original payment method.",
          "Refund timelines depend on the payment provider and bank.",
        ],
      },
    ],
    cta: {
      title: "Want to cancel an order?",
      text: "Open your order details page or contact support with your order ID.",
      label: "My Orders",
      to: "/orders",
    },
  },
};