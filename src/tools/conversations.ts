import { z } from 'zod';
import { IntercomClient } from '../api/client.ts';

export const GetConversationsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customer: z.string().optional(),
  state: z.string().optional(),
});

export async function getConversations(args: z.infer<typeof GetConversationsSchema>) {
  const client = new IntercomClient();
  
  const params: Parameters<typeof client.getConversations>[0] = {};
  
  if (args.startDate) {
    params.startDate = new Date(args.startDate);
  }
  if (args.endDate) {
    params.endDate = new Date(args.endDate);
  }
  if (args.customer) {
    params.customer = args.customer;
  }
  if (args.state) {
    params.state = args.state;
  }

  const { conversations } = await client.getConversations(params);
  
  return conversations.map(conv => ({
    id: conv.id,
    created_at: new Date(conv.created_at * 1000).toISOString(),
    updated_at: new Date(conv.updated_at * 1000).toISOString(),
    state: conv.state,
    priority: conv.priority,
    contacts: conv.contacts.map(contact => ({
      name: contact.name,
      id: contact.id,
    })),
    statistics: {
      responses: conv.statistics.responses,
      reopens: conv.statistics.reopens,
    },
  }));
}