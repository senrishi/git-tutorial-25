export default function LoginNavbarOption({ isActive = false, href, title }) {
    let classes;
    if (isActive) {
        classes = "inline-block border border-blue-500 rounded py-2 md:px-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white";

    }
    else {
        classes = 'inline-block border border-white roudned py-2 md:px-4 hover:bg-gray-200 active:bg-gray-400 text-blue-500';

    }
    return (
        <li className="md:mr-3 text-sm md:text-lg">
            <a className={classes} href={href}>{title}</a>
        </li>
    )
}