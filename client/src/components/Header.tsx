import { Link, useLocation } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';
import Icon from './ui/Icon';

declare const NL_APPVERSION: string;

function Header() {
    const location = useLocation();
    const showArrow = location.pathname !== '/';
    const version = NL_APPVERSION;

    return (
        <header className="flex items-center justify-center">
            <div className="flex gap-2 items-end">
                <Link className="text-3xl font-bold text-gold mt-8 flex flex-col items-center" to="/">
                    {showArrow && (
                        <div className="absolute left-1/2 -translate-x-16 translate-y-2">
                            <Icon icon={IoMdArrowRoundBack} />
                        </div>
                    )}
                    Ikusa x NodewarGG
                    <span className="text-xs font-light">
                        Logger <span className="text-xs">{version}</span>
                    </span>
                </Link>
            </div>
        </header>
    );
}

export default Header;