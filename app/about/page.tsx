import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Users, CheckCircle, Globe, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
  <div className="min-h-screen bg-white">
      {/* Header */}
  <header className="navbar-glass sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-blue-900 rounded-full avatar-glow"></div>
                <div className="w-8 h-8 bg-blue-700 rounded-full -ml-2 avatar-glow"></div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-widest drop-shadow-sm">KIRAN SALES</h1>
                <p className="text-xs text-gray-600 font-medium">Medical Uniforms & Linen</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-700 font-semibold text-base tracking-wide transition-colors">Home</Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-700 font-semibold text-base tracking-wide transition-colors">Products</Link>
              <Link href="/about" className="text-blue-700 font-semibold text-base tracking-wide">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-700 font-semibold text-base tracking-wide transition-colors">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
  <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-gray-100 text-blue-900">Since 1995</Badge>
              <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow">India’s Trusted Medical Uniform Brand</h1>
              <p className="text-lg text-gray-700 mb-8 max-w-xl">
                Kiran Sales is a family-owned business built on trust, quality, and a passion for healthcare. For over 25 years, we’ve partnered with hospitals, clinics, and professionals across India to deliver uniforms that feel as good as they look. Our story is one of real people, real care, and real results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white text-lg font-semibold px-8 py-3 rounded-full">
                  <Link href="/products">Shop Our Collection</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-blue-900 text-blue-900 text-lg font-semibold px-8 py-3 rounded-full">
                  <Link href="/contact">Contact Our Team</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/medical-professionals-wearing-scrubs-hospital-unif.jpg"
                alt="Kiran Sales team at work"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
  <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-10 border">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 text-lg">
                A journey of dedication, quality, and service to the healthcare community
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Founded on Quality & Trust</h3>
                <p className="text-gray-600 mb-6">
                  Kiran Sales was founded in 1995 with a simple mission: to provide healthcare professionals with the
                  highest quality medical uniforms and hospital linen. What started as a small family business has grown
                  into one of India's most trusted manufacturers in the medical textile industry.
                </p>
                <p className="text-gray-600 mb-6">
                  Our founder, Mr. Kiran Patel, recognized the need for durable, comfortable, and hygienic medical
                  apparel that could withstand the demanding environment of hospitals and clinics. This vision continues
                  to drive our innovation and commitment to excellence today.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">500+</div>
                    <div className="text-sm text-gray-600">Hospitals Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">25+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">10,000+</div>
                    <div className="text-sm text-gray-600">Happy Customers</div>
                  </div>
                </div>
              </div>
              <div>
                <Image
                  src="/white-doctor-coat-medical-uniform.jpg"
                  alt="Quality medical uniforms"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
  <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and every product we create
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center bg-white border shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle>Quality First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  ISO certified manufacturing processes ensure every product meets the highest standards of quality and
                  durability.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle>Healthcare Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Understanding the unique needs of healthcare professionals drives our product design and innovation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle>Customer Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Dedicated support team ensures every customer receives personalized attention and timely service.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle>Sustainability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Committed to eco-friendly manufacturing processes and sustainable materials for a better future.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Manufacturing Excellence */}
  <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Manufacturing Excellence</h2>
              <p className="text-gray-600 mb-6">
                Our state-of-the-art manufacturing facility in Mumbai is equipped with the latest technology and
                operated by skilled professionals who understand the critical importance of medical textiles.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">ISO 9001:2015 Certified Manufacturing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Advanced Quality Control Systems</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Antimicrobial Treatment Technology</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Eco-Friendly Production Processes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">24/7 Quality Monitoring</span>
                </div>
              </div>
            </div>
            <div>
              <Image
                src="/hospital-bed-linen-white-sterile.jpg"
                alt="Manufacturing facility"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the experienced professionals leading Kiran Sales towards continued excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">KP</span>
                </div>
                <CardTitle>Kiran Patel</CardTitle>
                <CardDescription>Founder & CEO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Visionary leader with 25+ years in medical textiles, driving innovation and quality excellence.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">AS</span>
                </div>
                <CardTitle>Anita Sharma</CardTitle>
                <CardDescription>Head of Operations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Operations expert ensuring seamless production and delivery processes across all product lines.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">RK</span>
                </div>
                <CardTitle>Rajesh Kumar</CardTitle>
                <CardDescription>Quality Assurance Director</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Quality champion with expertise in medical textile standards and certification processes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience the Kiran Sales Difference?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who trust Kiran Sales for their medical uniform and linen needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Link href="/products">Browse Products</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
