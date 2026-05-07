import { router } from "../trpc";
import { blogPostRouter } from "./blogpost.trpc";
import { clientRouter } from "./clients.trpc";
import { contactsRouter } from "./contacts.trpc";
import { enumRouter } from "./enum.trpc";
import { externalContactsRouter } from "./external-contacts.trpc";
import { legalEntityRouter } from "./legal-entities.trpc";
import { locationBdnbRouter } from "./locations-bdnb.trpc";
import { locationRouter } from "./locations.trpc";
import { operationRouter } from "./operations.trpc";
import { pdfGeneratorRouter } from "./pdf-generator.trpc";
import { prosRouter } from "./pros.trpc";
import { prospectRouter } from "./prospect.trpc";
import { quotesRouter } from "./quotes.trpc";
import { simulatorRouter } from "./simulator.trpc";
import { stripeRouter } from "./stripe.trpc";
import { useCaseRouter } from "./usecase.trpc";
import { userRouter } from "./users.trpc";
import { YousignRouter } from "./yousign.trpc";

export const appRouter = router({
  clients: clientRouter,
  contacts: contactsRouter,
  locations: locationRouter,
  locationsBdnb: locationBdnbRouter,
  legalEntities: legalEntityRouter,
  operations: operationRouter,
  pdfGenerator: pdfGeneratorRouter,
  prospect: prospectRouter,
  enum: enumRouter,
  pros: prosRouter,
  quotes: quotesRouter,
  simulator: simulatorRouter,
  users: userRouter,
  yousign: YousignRouter,
  blogPost: blogPostRouter,
  useCase: useCaseRouter,
  externalContacts: externalContactsRouter,
  stripe: stripeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
