import { Card, CardContent, CardHeader, CardTitle } from "./card";


const ServiceHours = () => {

    return (<>

        <Card className="w-auto">
            <CardHeader>
                <CardTitle className="scroll-m-20 text-3xl font-semibold tracking-tight text-lightYellow">
                    Service Hours
                </CardTitle>
            </CardHeader>
            <CardContent>

                <div className="my-6 w-full overflow-y-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="m-0 border-t p-0 even:bg-muted">
                                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                                    Day
                                </th>
                                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                                    Working Hours
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="m-0 border-t p-0 even:bg-muted">
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    Monday
                                </td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    9:00 AM - 5:00 PM
                                </td>
                            </tr>
                            <tr className="m-0 border-t p-0 even:bg-muted">
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    Tuesday
                                </td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    9:00 AM - 5:00 PM
                                </td>
                            </tr>
                            <tr className="m-0 border-t p-0 even:bg-muted">
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    Wednesday
                                </td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    9:00 AM - 5:00 PM
                                </td>

                            </tr>
                            <tr className="m-0 border-t p-0 even:bg-muted">
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    Thursday
                                </td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    9:00 AM - 5:00 PM
                                </td>

                            </tr>
                            <tr className="m-0 border-t p-0 even:bg-muted">
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    Thursday
                                </td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    9:00 AM - 5:00 PM
                                </td>

                            </tr>
                            <tr className="m-0 border-t p-0 even:bg-muted">
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    Friday
                                </td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    No Service
                                </td>

                            </tr>
                            <tr className="m-0 border-t p-0 even:bg-muted">
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    Sunday
                                </td>
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                                    No Service
                                </td>

                            </tr>
                        </tbody>
                    </table>
                </div>

            </CardContent>
        </Card>

    </>)


}
export default ServiceHours;