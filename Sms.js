import { CourierClient } from "@trycourier/courier";

const courier = CourierClient({
  authorizationToken: "pk_prod_NSXDKY9CAM4D7BN370HJ034HS57T",
});

const { requestId } = await courier.send({
  message: {
    content: {
      title: "Welcome to Courier!",
      body: "Want to hear a joke? {{joke}}",
    },
    data: {
      joke: "Why was the JavaScript developer sad? Because they didn't Node how to Express themselves",
    },
    to: {
      email: "poojamoukhede27@gmail.com",
    },
  },
});
