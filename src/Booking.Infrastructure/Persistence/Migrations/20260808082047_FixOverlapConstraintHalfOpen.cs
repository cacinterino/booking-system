using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booking.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixOverlapConstraintHalfOpen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE ""bookings""
    DROP CONSTRAINT ""EX_bookings_StaffTime_Overlap"";

ALTER TABLE ""bookings""
    ADD CONSTRAINT ""EX_bookings_StaffTime_Overlap""
    EXCLUDE USING gist (
        ""StaffId"" WITH =,
        tstzrange(""StartTime"", ""EndTime"", '[)') WITH &&
    )
    WHERE (""Status"" IN (1,2));
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE ""bookings""
    DROP CONSTRAINT ""EX_bookings_StaffTime_Overlap"";

ALTER TABLE ""bookings""
    ADD CONSTRAINT ""EX_bookings_StaffTime_Overlap""
    EXCLUDE USING gist (
        ""StaffId"" WITH =,
        tstzrange(""StartTime"", ""EndTime"", '[]') WITH &&
    )
    WHERE (""Status"" IN (1,2));
");
        }
    }
}