import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server } from "socket.io";
import { CONFIG } from "../../lib/config";
import { FeedActivityDto } from "./feed.dto";

export const FEED_ACTIVITY_CREATED_EVENT = "feed:activity-created";

@WebSocketGateway({
  cors: {
    origin: [CONFIG.CLIENT_URL],
  },
})
export class FeedRealtimeGateway {
  @WebSocketServer()
  private readonly server!: Server;

  emitActivityCreated(activity: FeedActivityDto) {
    this.server.emit(FEED_ACTIVITY_CREATED_EVENT, activity);
  }
}
