class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  include GlobalHelpers
  include Pundit
  
  helper_method GlobalHelpers.instance_methods

  # Override build_footer method in ActiveAdmin::Views::Pages
  require 'active_admin_views_pages_base.rb'

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def user_not_authorized
    render(file: File.join(Rails.root, 'public/403.html'), status: 403, layout: false)
  end

  before_filter :set_locale

  after_filter :store_location

  def set_locale
    # when user picks language through the language dropdown page reloads with the locale set as a param
    # save it to the session
    if params[:locale]
      session[:locale] = params[:locale]
    end

    # locale defined through the session takes precedence
    if session[:locale]
      I18n.locale = session[:locale]
    elsif user_signed_in? and !current_user.language_id.nil?
      # if user has set preferred language use it
      I18n.locale = Language.find_by_id(current_user.language_id).abbreviation
    elsif user_signed_in? and current_user.organisation.present? and !current_user.organisation[:language_id].nil?
      # use user's organization language, keep in mine the "OTHER ORG" edge case which should use default language
      I18n.locale = Language.find_by_id(current_user.organisation[:language_id]).abbreviation
    else
      # just use the default language (line included just for clarity, can be commented out as locale is always set to the default value)
      I18n.locale = I18n.default_locale
    end
  end

  def store_location
    # store last url - this is needed for post-login redirect to whatever the user last visited.
    if (request.fullpath != "/users/sign_in" && \
			 request.fullpath != "/users/sign_up" && \
			 request.fullpath != "/users/password" && \
            request.fullpath != "/users/sign_up?nosplash=true" && \
			 !request.xhr?) # don't store ajax calls
      session[:previous_url] = request.fullpath
    end
  end

  def after_sign_in_path_for(resource)
    session[:previous_url] || root_path
  end

  def after_sign_up_path_for(resource)
    session[:previous_url] || root_path
  end

  def after_sign_in_error_path_for(resource)
    session[:previous_url] || root_path
  end

  def after_sign_up_error_path_for(resource)
    session[:previous_url] || root_path
  end

  def authenticate_admin!
    # currently if admin has any super-admin task, they can view the super-admin
    redirect_to root_path unless user_signed_in? && (current_user.can_add_orgs? || current_user.can_change_org? || current_user.can_super_admin?)
  end

  def get_plan_list_columns
    if user_signed_in?
      @selected_columns = current_user.settings(:plan_list).columns
      @all_columns = Settings::PlanList::ALL_COLUMNS
    end
  end
end
