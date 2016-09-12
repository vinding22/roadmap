class LocalesController < ApplicationController
  def index
    end

  # called by the language dropdown to change the locale
  def set_locale_session
    session[:locale] = params[:locale]
    redirect_to(:back)
  end
end