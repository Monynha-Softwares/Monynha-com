import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import Meta from '@/components/Meta';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const projectTypes = [
  'Custom AI Assistant',
  'Restaurant Management System',
  'Business Automation',
  'Legacy System Integration',
  'Consulting Services',
  'Other',
];

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    project: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!formData.name.trim())
      newErrors.name = t('contact.validation.required');
    if (!formData.email.trim())
      newErrors.email = t('contact.validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = t('contact.validation.invalidEmail');
    if (!formData.message.trim())
      newErrors.message = t('contact.validation.required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from('leads').insert([
        {
          name: formData.name,
          email: formData.email,
          company: formData.company || null,
          project: formData.project || null,
          message: formData.message,
        },
      ]);

      if (error) {
        console.error('Error submitting form:', error);
        toast({
          title: t('contact.toasts.errorTitle'),
          description: t('contact.toasts.errorDescription'),
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitted(true);
      toast({
        title: t('contact.toasts.successTitle'),
        description: t('contact.toasts.successDescription'),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t('contact.toasts.errorTitle'),
        description: t('contact.toasts.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = useMemo(
    () => [
      {
        icon: Mail,
        title: t('contact.info.emailUs'),
        content: 'hello@monynha.com',
        description: t('contact.info.sendEmail'),
      }, // ,
      // {
      //   icon: Phone,
      //   title: t('contact.info.callUs'),
      //   content: '+1 (555) 123-4567',
      //   description: t('contact.info.callPhone')
      // },
      // {
      //   icon: MapPin,
      //   title: t('contact.info.visitUs'),
      //   content: 'San Francisco, CA',
      //   description: t('contact.info.visit')
      // }
    ],
    [t]
  );

  if (isSubmitted) {
    return (
      <Layout>
        <Meta
          title="Contact - Monynha Softwares Agency"
          description={t('contact.description')}
          ogTitle="Contact - Monynha Softwares Agency"
          ogDescription={t('contact.description')}
          ogImage="/placeholder.svg"
        />
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">{t('navigation.home')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('navigation.contact')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <section className="py-24 bg-white min-h-screen flex items-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {t('contact.thankYou.title')}
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              {t('contact.thankYou.description')}
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="btn-secondary"
            >
              {t('contact.thankYou.another')}
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Meta
        title="Contact - Monynha Softwares Agency"
        description={t('contact.description')}
        ogTitle="Contact - Monynha Softwares Agency"
        ogDescription={t('contact.description')}
        ogImage="/placeholder.svg"
      />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('navigation.home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('navigation.contact')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Hero Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              {t('contact.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-soft-lg rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                    {t('contact.form.headline')}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          {t('contact.form.fullName')}
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="rounded-xl border-neutral-200 focus:border-brand-blue focus:ring-brand-blue"
                          placeholder={t('contact.form.placeholderName')}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          {t('contact.form.email')}
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="rounded-xl border-neutral-200 focus:border-brand-blue focus:ring-brand-blue"
                          placeholder={t('contact.form.placeholderEmail')}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="company"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          {t('contact.form.company')}
                        </label>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="rounded-xl border-neutral-200 focus:border-brand-blue focus:ring-brand-blue"
                          placeholder={t('contact.form.placeholderCompany')}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="project"
                          className="block text-sm font-medium text-neutral-700 mb-2"
                        >
                          {t('contact.form.projectType')}
                        </label>
                        <select
                          id="project"
                          name="project"
                          value={formData.project}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-xl focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none text-neutral-900"
                        >
                          <option value="">{t('contact.form.select')}</option>
                          {projectTypes.map((type, index) => (
                            <option key={index} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-neutral-700 mb-2"
                      >
                        {t('contact.form.details')}
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        className="rounded-xl border-neutral-200 focus:border-brand-blue focus:ring-brand-blue resize-none"
                        placeholder={t('contact.form.placeholderDetails')}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="btn-primary w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? t('contact.form.sending')
                        : t('contact.form.send')}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  {t('contact.info.getInTouch')}
                </h2>
                <p className="text-neutral-600 mb-8">
                  {t('contact.info.description')}
                </p>
              </div>

              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-soft hover:shadow-soft-lg transition-all ease-in-out duration-300 card-hover rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {info.title}
                        </h3>
                        <p className="text-lg text-brand-blue font-medium mb-1">
                          {info.content}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-0 shadow-soft rounded-2xl bg-gradient-hero text-white">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-2">
                    {t('contact.info.quick')}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {t('contact.info.quickDesc')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
