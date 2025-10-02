import { Link, useLocation } from 'react-router-dom';
import { IoMdArrowRoundBack } from 'react-icons/io';
import Icon from './ui/Icon';

declare const NL_APPVERSION: string;

function Header() {
    const location = useLocation();
    const showArrow = location.pathname !== '/';
    const version = NL_APPVERSION;

    return (
        <header className="flex justify-center gap-0.5 text-2xl font-bold text-cta mt-4 flex-col items-center">
            {showArrow && (
                <Link to="/" className="absolute left-10 top-10">
                    <Icon icon={IoMdArrowRoundBack} />
                </Link>
            )}
            NodewarGG x Ikusa
            <span className="text-xs">v{version}</span>
        </header>
    );
}

export default Header;