using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booking.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingAccessCodeAndOverlapConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccessCode",
                table: "bookings",
                type: "character varying(12)",
                maxLength: 12,
                nullable: true);

            migrationBuilder.Sql(@"
CREATE EXTENSION IF NOT EXISTS btree_gist;

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
ALTER TABLE ""bookings"" DROP CONSTRAINT ""EX_bookings_StaffTime_Overlap"";
");
            migrationBuilder.DropColumn(
                name: "AccessCode",
                table: "bookings");
        }
    }
}
