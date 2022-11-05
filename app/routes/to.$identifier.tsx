import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { db } from "~/db";
import type {
  FindTeamsByEventId,
  FindTeamsByEventIdItem,
} from "~/db/models/tournaments/queries.server";
import type { TournamentTeam } from "~/db/types";
import { getUser } from "~/modules/auth";
import { notFoundIfFalsy } from "~/utils/remix";
import { findOwnedTeam } from "~/utils/tournaments";

export type TournamentToolsLoaderData = SerializeFrom<typeof loader>;

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await getUser(request);
  const eventId = params["identifier"]!;

  const event = notFoundIfFalsy(db.tournaments.findByIdentifier(eventId));
  const teams = db.tournaments.findTeamsByEventId(event.id);

  return {
    event,
    tieBreakerMapPool:
      db.calendarEvents.findTieBreakerMapPoolByEventId(eventId),
    teams: event.isBeforeStart ? censorMapPools({ teams }) : teams,
    ownTeam: findOwnedTeam({ userId: user?.id, teams }),
  };
};

function censorMapPools({
  teams,
  ownTeamId,
}: {
  teams: FindTeamsByEventId;
  ownTeamId?: TournamentTeam["id"];
}) {
  return teams.map((team) =>
    team.id === ownTeamId
      ? team
      : {
          ...team,
          mapPool:
            // can be used to show checkmark in UI if team has submitted
            // the map pool without revealing the contents
            team.mapPool.length > 0
              ? ([] as FindTeamsByEventIdItem["mapPool"])
              : undefined,
        }
  );
}

export default function TournamentToolsLayout() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet context={data} />
    </>
  );
}