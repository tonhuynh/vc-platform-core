namespace VirtoCommerce.Platform.Core
{
    public class PlatformOptions
    {
        public string DemoCredentials { get; set; }
        public string DemoResetTime { get; set; }


        public string LocalUploadFolderPath { get; set; } = "App_Data/Uploads";
        //The public url for license activation
        public string LicenseActivationUrl { get; set; } = "https://virtocommerce.com/admin/api/licenses/activate/";
        //Local path for license file
        public string LicenseFilePath { get; set; } = "App_Data/VirtoCommerce.lic";
        //Local path to public key for license 
        public string LicensePublicKeyPath { get; set; } = "App_Data/VirtoCommerce_rsa.pub";
        //Local path to private key for signing license
        public string LicensePrivateKeyPath { get; set; }
        //Url for discovery sample data for initial installation
        //e.g. http://virtocommerce.blob.core.windows.net/sample-data
        public string SampleDataUrl { get; set; }
        //Default path to store export files 
        public string DefaultExportFolder = "App_Data/Export/";
        public string DefaultExportFileName = "exported_data.zip";

        public bool RequireHttps { get; set; } = false;
    }

}
