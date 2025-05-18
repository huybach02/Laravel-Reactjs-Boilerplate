interface HeadingProps {
    title: string;
    description: string;
}

const Heading = ({ title, description }: HeadingProps) => {
    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
};
export default Heading;
