export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container max-w-4xl mx-auto px-6 space-y-8 text-white/80">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
            DMCA
        </h1>
        
        <div className="space-y-6 text-lg leading-relaxed">
            <p>
                Kumo Anime respects the intellectual property rights of others. We comply with the Digital Millennium Copyright Act (DMCA) and other applicable copyright laws.
            </p>
            <p>
                Kumo does not host any files on its servers. All content is provided by non-affiliated third parties. We do not accept responsibility for content hosted on third-party websites and do not have any involvement in the downloading or uploading of movies. We only post links providing easy access to content that is already available on the internet.
            </p>
            <p>
                If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible on this site, please notify our copyright agent as set forth in the DMCA. For your complaint to be valid under the DMCA, you must provide the following information in writing:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                <li>An electronic or physical signature of a person authorized to act on behalf of the copyright owner.</li>
                <li>Identification of the copyrighted work that you claim has been infringed.</li>
                <li>Identification of the material that is claimed to be infringing and where it is located on the service.</li>
                <li>Information reasonably sufficient to permit the service provider to contact you, such as your address, telephone number, and, email address.</li>
                <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or law.</li>
                <li>A statement, made under penalty of perjury, that the above information is accurate, and that you are the copyright owner or are authorized to act on behalf of the owner.</li>
            </ul>
            <p className="pt-4 border-t border-white/10">
                Please note that this procedure is exclusively for notifying Kumo that your copyrighted material has been infringed.
            </p>
        </div>
      </div>
    </div>
  );
}
