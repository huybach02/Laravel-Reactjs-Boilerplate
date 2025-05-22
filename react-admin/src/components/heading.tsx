import { Typography } from "antd";

const Heading = ({
    title,
    description,
}: {
    title: string;
    description: string;
}) => {
    return (
        <div>
            <Typography.Title level={2}>{title}</Typography.Title>
            <Typography.Paragraph>{description}</Typography.Paragraph>
        </div>
    );
};

export default Heading;
