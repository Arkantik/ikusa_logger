import { useEffect, useState } from 'react';
import { LuUsers, LuShield } from 'react-icons/lu';
import type { LogType } from '../create-config/config';
import Icon from './Icon';

interface GuildStatsProps {
    logs: LogType[];
}

interface GuildData {
    name: string;
    members: Set<string>;
    kills: number;
    deaths: number;
}

function GuildStats({ logs }: GuildStatsProps) {
    const [guilds, setGuilds] = useState<Map<string, GuildData>>(new Map());

    useEffect(() => {
        const guildMap = new Map<string, GuildData>();

        logs.forEach((log) => {
            const names = log.names.map(n => n.name);

            // The format is: [PlayerOne, PlayerTwo, Guild, Character1, Character2]
            // PlayerTwo (index 1) belongs to Guild (index 2)
            if (names.length >= 3) {
                const playerTwo = names[1];
                const guildName = names[2];

                if (!guildName || guildName === '-1' || guildName.trim() === '') return;
                if (!playerTwo || playerTwo === '-1' || playerTwo.trim() === '') return;

                if (!guildMap.has(guildName)) {
                    guildMap.set(guildName, {
                        name: guildName,
                        members: new Set<string>(),
                        kills: 0,
                        deaths: 0
                    });
                }

                const guild = guildMap.get(guildName)!;
                guild.members.add(playerTwo);
            }
        });

        setGuilds(guildMap);
    }, [logs]);

    const sortedGuilds = Array.from(guilds.values()).sort((a, b) => {
        return b.members.size - a.members.size;
    });

    return (
        <div className="glass-card rounded-2xl p-4 border border-white/10 h-full flex flex-col">
            <div className="flex items-center gap-1 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                    <Icon icon={LuUsers} size="sm" className="text-yellow-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-400">Members per guilds</h3>
            </div>

            <div className="flex-1 overflow-hidden space-y-2 p-2 rounded-lg border border-white/10 bg-black/20">
                {sortedGuilds.map((guild) => (
                    <div
                        key={guild.name}
                        className="py-1 px-2.5 rounded-lg glass-card border border-white/10"
                    >
                        <span className="text-sm font-semibold text-white truncate">
                            {guild.name} - {guild.members.size}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GuildStats;