using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ModifiedQRCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UniqueCode",
                table: "RewardExchanges",
                newName: "QRCode");

            migrationBuilder.RenameColumn(
                name: "UniqueCode",
                table: "Orders",
                newName: "QRCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "QRCode",
                table: "RewardExchanges",
                newName: "UniqueCode");

            migrationBuilder.RenameColumn(
                name: "QRCode",
                table: "Orders",
                newName: "UniqueCode");
        }
    }
}
