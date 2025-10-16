import { useState } from 'react';
import { LuChevronDown, LuChevronUp, LuCircleCheck, LuInfo, LuSettings, LuTriangleAlert } from 'react-icons/lu';
import Icon from '../components/ui/Icon';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
            >
                <span className="text-base font-semibold text-white text-left">{title}</span>
                <Icon icon={isOpen ? LuChevronUp : LuChevronDown} size="sm" className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="px-5 pb-5 text-sm text-gray-300 leading-relaxed space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
}

function DocsPage() {
    return (
        <div className="flex flex-col h-full w-full overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full p-8 space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
                            <Icon icon={LuInfo} size="lg" className="text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Documentation</h1>
                            <p className="text-sm text-gray-400">Everything you need to know about the Combat Logger</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-cta-500/50 bg-cta-500/5">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-cta-500/20 to-orange-500/20 rounded-xl flex-shrink-0">
                            <Icon icon={LuTriangleAlert} size="lg" className="text-cta-400" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Important: Optimize Your Logs
                            </h2>
                            <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
                                <p>
                                    <strong className="text-cta-400">Enable Character Names:</strong> We strongly recommend enabling the <strong>Characters</strong> checkbox in the recording options (click the <LuSettings size={16} className="inline text-cta-400 mx-1" /> cog wheel icon). This provides additional character data that enhances your combat log analysis on NodewarGG.
                                </p>
                                <p>
                                    <strong className="text-cta-400">Follow the Correct Format:</strong> Always ensure your logs follow the format shown above the recorded events:
                                </p>
                                <div className="bg-black/30 rounded-lg p-4 font-mono text-xs border border-white/10">
                                    <span className="text-gray-400">Format:</span> <span className="text-cta-400">YourGuild-FamilyName</span> <span className="text-green-400">killed</span>/<span className="text-red-400">died to</span> <span className="text-blue-400">Enemy-FamilyName</span> from <span className="text-purple-400">Guild</span>
                                </div>
                                <p className="flex items-start gap-2">
                                    <Icon icon={LuCircleCheck} size="sm" className="text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>If you didn't apply the correct format during recording, don't worry! You can open the saved log file and update it before uploading to NodewarGG. Using the wrong format will result in incorrect class identification and data display on the website.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-lg">
                            <Icon icon={LuTriangleAlert} className="text-red-400" />
                        </div>
                        Troubleshooting
                    </h2>

                    <AccordionItem title="Startup Issues" defaultOpen={true}>
                        <p className="font-semibold text-white">Problem: Logger won't start or shows errors immediately</p>
                        <ol className="list-inside space-y-2 ml-2">
                            <li>Check if Npcap is properly installed:
                                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                    <li>Open the logger</li>
                                    <li>Check the status message on the home screen</li>
                                    <li>If it says "Npcap is not installed", download and install from <a href="https://npcap.com/dist/" className="text-cta-400 hover:text-cta-300 underline">npcap.com</a></li>
                                </ul>
                            </li>
                        </ol>
                    </AccordionItem>

                    <AccordionItem title='"The system cannot find the path specified" Error'>
                        <p>This error usually means Python is not added to your system PATH:</p>
                        <ol className="list-decimal list-inside space-y-2 ml-2 mt-3">
                            <li>Follow this guide to add Python to PATH: <a href="https://www.pythoncentral.io/add-python-to-path-python-is-not-recognized-as-an-internal-or-external-command/" className="text-cta-400 hover:text-cta-300 underline break-all">Python PATH Configuration Guide</a></li>
                            <li>After adding Python to PATH, restart your computer</li>
                            <li>Try building again</li>
                        </ol>
                    </AccordionItem>

                    <AccordionItem title="No Logs Being Captured">
                        <ol className="list-decimal list-inside space-y-3 ml-2">
                            <li>
                                <strong className="text-white">VPN or Software altering your network:</strong> If you are using a VPN or any software that alters your normal network, it will prevent the tool from picking up events during your record session.
                            </li>
                            <li>
                                <strong className="text-white">Config is outdated:</strong> BDO changes its network structure after each weekly maintenance
                                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                    <li>Wait for a config update</li>
                                    <li>Check the Discord for announcements</li>
                                    <li>As a backup, use Wireshark to record the session, then analyze the .pcap file later</li>
                                </ul>
                            </li>
                            <li>
                                <strong className="text-white">Wrong network interface selected:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                    <li>Go to Settings</li>
                                    <li>Try switching between "All" and "Default" network interfaces</li>
                                    <li>Restart recording</li>
                                </ul>
                            </li>
                            <li>
                                <strong className="text-white">Firewall or antivirus blocking:</strong>
                                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                    <li>Add an exception for the logger in your antivirus</li>
                                    <li>Run the logger as Administrator</li>
                                </ul>
                            </li>
                        </ol>
                    </AccordionItem>

                    <AccordionItem title="Logs Have Wrong Names">
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>In the log display, use the dropdown menus to reorder the names</li>
                            <li>The correct format is: <span className="font-mono text-cta-400">YourGuild-FamilyName killed/died to Enemy-FamilyName from Guild</span></li>
                            <li>Save the corrected logs</li>
                        </ol>
                    </AccordionItem>

                    <AccordionItem title="Can't Save Logs / Logs Not Found">
                        <ol className="list-decimal list-inside space-y-2 ml-2">
                            <li>Make sure you've adjusted the names correctly</li>
                            <li>Check that you have write permissions in the save location</li>
                            <li>Try saving to a different folder (like Documents)</li>
                        </ol>
                    </AccordionItem>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                            <Icon icon={LuInfo} className="text-purple-400" />
                        </div>
                        Frequently Asked Questions
                    </h2>

                    <AccordionItem title="Is this tool safe to use?">
                        <p>Yes, the logger only reads network packets and doesn't modify or inject anything into the game.</p>
                    </AccordionItem>

                    <AccordionItem title="Will I get banned for using this?">
                        <p>The tool operates similarly to Wireshark and only observes network traffic. However, use at your own discretion.</p>
                    </AccordionItem>

                    <AccordionItem title="Why is the config outdated after maintenance?">
                        <p>BDO changes its network packet structure during weekly maintenance. The config needs to be updated to match these changes. Check Discord for updates.</p>
                    </AccordionItem>

                    <AccordionItem title="Can I use this during any PvP activity?">
                        <p>Yes! It works during Node Wars, Sieges and GvG.</p>
                    </AccordionItem>

                    <AccordionItem title="Can I edit logs after saving them?">
                        <p>Yes! Use the Open function to load your .log file, adjust the names, and save again.</p>
                    </AccordionItem>

                    <AccordionItem title="What if I accidentally close the logger while recording?">
                        <p>A warning message should appear asking you to confirm. If you lose data, you can use your Wireshark recording as backup (if you made one).</p>
                    </AccordionItem>
                </div>

                <div className="glass-card rounded-2xl p-6 border border-white/10 bg-blue-500/5">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex-shrink-0">
                            <Icon icon={LuInfo} size="lg" className="text-blue-400" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <h3 className="text-xl font-bold text-white">Need More Help?</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                If you're experiencing issues or have questions not covered here:
                            </p>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400">•</span>
                                    <span><strong className="text-white">Discord:</strong> Join our community server at <a href="https://discord.gg/CUc38nKyDU" className="text-blue-400 hover:text-blue-300 underline">discord.gg/CUc38nKyDU</a></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-400">•</span>
                                    <span><strong className="text-white">GitHub:</strong> Report bugs on the <a href="https://github.com/Arkantik/ikusa_logger/issues" className="text-blue-400 hover:text-blue-300 underline">Issues page</a></span>
                                </li>
                            </ul>
                            <div className="bg-black/30 rounded-lg p-4 space-y-2 text-xs text-gray-400 border border-white/10">
                                <p className="font-semibold text-white">When asking for help, please provide:</p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>Your Windows version</li>
                                    <li>The exact error message (if any)</li>
                                    <li>What you were doing when the problem occurred</li>
                                    <li>Screenshots if possible</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocsPage;